"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import {
  deleteR2ObjectByKey,
  getR2ObjectKeyFromPublicUrl,
} from "@/lib/storage/r2-object";
import {
  completePreparedMediaCommit,
  PendingMediaCommitError,
  preparePendingMediaCommit,
  rollbackPreparedMediaCommit,
  type PreparedMediaCommit,
} from "@/lib/storage/r2-pending";

import { galleryAlbumFormSchema, galleryAlbumIdSchema } from "./schemas";
import type { GalleryAlbumActionState, GalleryAlbumFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const GALLERY_MEDIA_PREFIX = "galleries/";

const galleryAlbumSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  eventDate: true,
  coverImageUrl: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GalleryAlbumSelect;

type GalleryAlbumRecord = Prisma.GalleryAlbumGetPayload<{
  select: typeof galleryAlbumSelect;
}>;

function getAlbumFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    eventDate: formData.get("eventDate") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    isPublished: formData.get("isPublished") ?? "",
  };
}

function validationErrorState(error: z.ZodError): GalleryAlbumActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data album galeri.",
    fieldErrors: errors as Partial<Record<GalleryAlbumFieldName, string[]>>,
  };
}

function invalidSlugState(): GalleryAlbumActionState {
  return {
    status: "error",
    message: "Slug album tidak valid.",
    fieldErrors: {
      slug: ["Gunakan judul atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): GalleryAlbumActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh album lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidPendingCoverState(message: string): GalleryAlbumActionState {
  return {
    status: "error",
    message: "Gambar sampul belum dapat diterapkan.",
    fieldErrors: {
      coverImageUrl: [message],
    },
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function toAuditValue(album: GalleryAlbumRecord) {
  return {
    ...album,
    eventDate: album.eventDate?.toISOString().slice(0, 10) ?? null,
    publishedAt: album.publishedAt?.toISOString() ?? null,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };
}

function revalidateGalleryPaths(slugs: Array<string | null | undefined>): void {
  revalidatePath("/");
  revalidatePath("/galeri");
  revalidatePath("/konsol-8m4q7x2k9v6d/galeri");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/galeri/${slug}`);
    }
  }
}

async function cleanupReplacedCover({
  previousUrl,
  nextUrl,
}: {
  previousUrl: string | null | undefined;
  nextUrl: string | null | undefined;
}): Promise<void> {
  const previousKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!previousKey || !previousKey.startsWith(GALLERY_MEDIA_PREFIX)) {
    return;
  }

  const nextKey = getR2ObjectKeyFromPublicUrl(nextUrl);

  if (nextKey === previousKey) {
    return;
  }

  try {
    await deleteR2ObjectByKey(previousKey);
  } catch (error) {
    console.error("Gagal menghapus sampul album lama dari R2.", {
      objectKey: previousKey,
      error,
    });
  }
}

async function cleanupGalleryObjects(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const objectKeys = new Set<string>();

  for (const url of urls) {
    const objectKey = getR2ObjectKeyFromPublicUrl(url);

    if (objectKey && objectKey.startsWith(GALLERY_MEDIA_PREFIX)) {
      objectKeys.add(objectKey);
    }
  }

  const results = await Promise.allSettled(
    Array.from(objectKeys).map((objectKey) => deleteR2ObjectByKey(objectKey)),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error("Gagal membersihkan object galeri dari R2.", {
        objectKey: Array.from(objectKeys)[index],
        error: result.reason,
      });
    }
  });
}

export async function createGalleryAlbumAction(
  _previousState: GalleryAlbumActionState,
  formData: FormData,
): Promise<GalleryAlbumActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryAlbumFormSchema.safeParse(getAlbumFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedCover: PreparedMediaCommit | null = null;

  let databaseCommitted = false;

  try {
    preparedCover = await preparePendingMediaCommit(
      parsed.data.coverImageUrl,
      "galleries",
    );

    const coverImageUrl = preparedCover?.finalUrl ?? parsed.data.coverImageUrl;

    const createdAlbum = await prisma.$transaction(async (transaction) => {
      const album = await transaction.galleryAlbum.create({
        data: {
          title: parsed.data.title,
          slug,
          description: parsed.data.description,
          eventDate: parsed.data.eventDate,
          coverImageUrl,
          isPublished: parsed.data.isPublished,
          publishedAt: parsed.data.isPublished ? new Date() : null,
        },
        select: galleryAlbumSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_ALBUM_CREATED",
          entity: "GalleryAlbum",
          entityId: album.id,
          newValue: toAuditValue(album),
        },
      });

      return album;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedCover);

    revalidateGalleryPaths([createdAlbum.slug]);

    return {
      status: "success",
      message: "Album galeri berhasil ditambahkan.",
      albumId: createdAlbum.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedCover);
    }

    console.error("Gagal menambahkan album galeri.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingCoverState(error.message);
    }

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Album galeri gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateGalleryAlbumAction(
  _previousState: GalleryAlbumActionState,
  formData: FormData,
): Promise<GalleryAlbumActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = galleryAlbumIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID album galeri tidak valid.",
    };
  }

  const parsed = galleryAlbumFormSchema.safeParse(getAlbumFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedCover: PreparedMediaCommit | null = null;

  let databaseCommitted = false;

  try {
    const currentAlbum = await prisma.galleryAlbum.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: galleryAlbumSelect,
    });

    if (!currentAlbum) {
      return {
        status: "error",
        message: "Album galeri tidak ditemukan.",
      };
    }

    preparedCover = await preparePendingMediaCommit(
      parsed.data.coverImageUrl,
      "galleries",
    );

    const coverImageUrl = preparedCover?.finalUrl ?? parsed.data.coverImageUrl;

    const updatedAlbum = await prisma.$transaction(async (transaction) => {
      const album = await transaction.galleryAlbum.update({
        where: {
          id: currentAlbum.id,
        },
        data: {
          title: parsed.data.title,
          slug,
          description: parsed.data.description,
          eventDate: parsed.data.eventDate,
          coverImageUrl,
          isPublished: parsed.data.isPublished,
          publishedAt: parsed.data.isPublished
            ? (currentAlbum.publishedAt ?? new Date())
            : null,
        },
        select: galleryAlbumSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_ALBUM_UPDATED",
          entity: "GalleryAlbum",
          entityId: currentAlbum.id,
          oldValue: toAuditValue(currentAlbum),
          newValue: toAuditValue(album),
        },
      });

      return album;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedCover);

    await cleanupReplacedCover({
      previousUrl: currentAlbum.coverImageUrl,
      nextUrl: updatedAlbum.coverImageUrl,
    });

    revalidateGalleryPaths([currentAlbum.slug, updatedAlbum.slug]);

    return {
      status: "success",
      message: "Album galeri berhasil diperbarui.",
      albumId: updatedAlbum.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedCover);
    }

    console.error("Gagal memperbarui album galeri.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingCoverState(error.message);
    }

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Album galeri gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteGalleryAlbumAction(
  _previousState: GalleryAlbumActionState,
  formData: FormData,
): Promise<GalleryAlbumActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryAlbumIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID album galeri tidak valid.",
    };
  }

  try {
    const currentAlbum = await prisma.galleryAlbum.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: {
        ...galleryAlbumSelect,
        media: {
          select: {
            fileUrl: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (!currentAlbum) {
      return {
        status: "error",
        message: "Album galeri tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.galleryAlbum.delete({
        where: {
          id: currentAlbum.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_ALBUM_DELETED",
          entity: "GalleryAlbum",
          entityId: currentAlbum.id,
          oldValue: {
            ...toAuditValue(currentAlbum),
            deletedMediaCount: currentAlbum.media.length,
          },
        },
      });
    });

    await cleanupGalleryObjects([
      currentAlbum.coverImageUrl,
      ...currentAlbum.media.flatMap((media) => [
        media.fileUrl,
        media.thumbnailUrl,
      ]),
    ]);

    revalidateGalleryPaths([currentAlbum.slug]);

    return {
      status: "success",
      message:
        currentAlbum.media.length > 0
          ? `Album dan ${currentAlbum.media.length} media di dalamnya berhasil dihapus.`
          : "Album galeri berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus album galeri.", error);

    return {
      status: "error",
      message: "Album galeri gagal dihapus. Silakan coba kembali.",
    };
  }
}
