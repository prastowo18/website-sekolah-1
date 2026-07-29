"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

import {
  galleryAlbumFormSchema,
  galleryAlbumIdSchema,
  galleryMediaFormSchema,
  galleryMediaIdSchema,
} from "./schemas";
import type {
  GalleryAlbumActionState,
  GalleryAlbumFieldName,
  GalleryMediaActionState,
  GalleryMediaFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

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

const galleryMediaSelect = {
  id: true,
  albumId: true,
  mediaType: true,
  fileUrl: true,
  thumbnailUrl: true,
  caption: true,
  altText: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GalleryMediaSelect;

type GalleryAlbumRecord = Prisma.GalleryAlbumGetPayload<{
  select: typeof galleryAlbumSelect;
}>;

type GalleryMediaRecord = Prisma.GalleryMediaGetPayload<{
  select: typeof galleryMediaSelect;
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

function getMediaFormValues(formData: FormData) {
  return {
    albumId: formData.get("albumId"),
    mediaType: formData.get("mediaType"),
    fileUrl: formData.get("fileUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") ?? "",
    caption: formData.get("caption") ?? "",
    altText: formData.get("altText") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  };
}

function albumValidationErrorState(error: z.ZodError): GalleryAlbumActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data album galeri.",
    fieldErrors: errors as Partial<Record<GalleryAlbumFieldName, string[]>>,
  };
}

function mediaValidationErrorState(error: z.ZodError): GalleryMediaActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data media galeri.",
    fieldErrors: errors as Partial<Record<GalleryMediaFieldName, string[]>>,
  };
}

function invalidAlbumSlugState(): GalleryAlbumActionState {
  return {
    status: "error",
    message: "Slug album tidak valid.",
    fieldErrors: {
      slug: ["Gunakan judul atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueAlbumSlugState(): GalleryAlbumActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh album lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidAlbumState(): GalleryMediaActionState {
  return {
    status: "error",
    message: "Album galeri tidak ditemukan.",
    fieldErrors: {
      albumId: ["Pilih album yang masih tersedia."],
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

function toAlbumAuditValue(album: GalleryAlbumRecord) {
  return {
    ...album,
    eventDate: album.eventDate?.toISOString().slice(0, 10) ?? null,
    publishedAt: album.publishedAt?.toISOString() ?? null,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };
}

function toMediaAuditValue(media: GalleryMediaRecord) {
  return {
    ...media,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
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

async function findAlbum(id: string): Promise<{
  id: string;
  slug: string;
  title: string;
} | null> {
  return prisma.galleryAlbum.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });
}

export async function createGalleryAlbumAction(
  _previousState: GalleryAlbumActionState,
  formData: FormData,
): Promise<GalleryAlbumActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryAlbumFormSchema.safeParse(getAlbumFormValues(formData));

  if (!parsed.success) {
    return albumValidationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidAlbumSlugState();
  }

  try {
    const createdAlbum = await prisma.$transaction(async (transaction) => {
      const album = await transaction.galleryAlbum.create({
        data: {
          title: parsed.data.title,
          slug,
          description: parsed.data.description,
          eventDate: parsed.data.eventDate,
          coverImageUrl: parsed.data.coverImageUrl,
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
          newValue: toAlbumAuditValue(album),
        },
      });

      return album;
    });

    revalidateGalleryPaths([createdAlbum.slug]);

    return {
      status: "success",
      message: "Album galeri berhasil ditambahkan.",
      albumId: createdAlbum.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan album galeri.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueAlbumSlugState();
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
    return albumValidationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidAlbumSlugState();
  }

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
          coverImageUrl: parsed.data.coverImageUrl,
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
          oldValue: toAlbumAuditValue(currentAlbum),
          newValue: toAlbumAuditValue(album),
        },
      });

      return album;
    });

    revalidateGalleryPaths([currentAlbum.slug, updatedAlbum.slug]);

    return {
      status: "success",
      message: "Album galeri berhasil diperbarui.",
      albumId: updatedAlbum.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui album galeri.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueAlbumSlugState();
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
        _count: {
          select: {
            media: true,
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
            ...toAlbumAuditValue(currentAlbum),
            deletedMediaCount: currentAlbum._count.media,
          },
        },
      });
    });

    revalidateGalleryPaths([currentAlbum.slug]);

    return {
      status: "success",
      message:
        currentAlbum._count.media > 0
          ? `Album dan ${currentAlbum._count.media} media di dalamnya berhasil dihapus.`
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

export async function createGalleryMediaAction(
  _previousState: GalleryMediaActionState,
  formData: FormData,
): Promise<GalleryMediaActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryMediaFormSchema.safeParse(getMediaFormValues(formData));

  if (!parsed.success) {
    return mediaValidationErrorState(parsed.error);
  }

  try {
    const album = await findAlbum(parsed.data.albumId);

    if (!album) {
      return invalidAlbumState();
    }

    const createdMedia = await prisma.$transaction(async (transaction) => {
      const media = await transaction.galleryMedia.create({
        data: {
          albumId: album.id,
          mediaType: parsed.data.mediaType,
          fileUrl: parsed.data.fileUrl,
          thumbnailUrl: parsed.data.thumbnailUrl,
          caption: parsed.data.caption,
          altText: parsed.data.altText,
          sortOrder: parsed.data.sortOrder,
        },
        select: galleryMediaSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_MEDIA_CREATED",
          entity: "GalleryMedia",
          entityId: media.id,
          newValue: toMediaAuditValue(media),
        },
      });

      return media;
    });

    revalidateGalleryPaths([album.slug]);

    return {
      status: "success",
      message: "Media galeri berhasil ditambahkan.",
      mediaId: createdMedia.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan media galeri.", error);

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidAlbumState();
    }

    return {
      status: "error",
      message: "Media galeri gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateGalleryMediaAction(
  _previousState: GalleryMediaActionState,
  formData: FormData,
): Promise<GalleryMediaActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = galleryMediaIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID media galeri tidak valid.",
    };
  }

  const parsed = galleryMediaFormSchema.safeParse(getMediaFormValues(formData));

  if (!parsed.success) {
    return mediaValidationErrorState(parsed.error);
  }

  try {
    const currentMedia = await prisma.galleryMedia.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: {
        ...galleryMediaSelect,
        album: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!currentMedia) {
      return {
        status: "error",
        message: "Media galeri tidak ditemukan.",
      };
    }

    const targetAlbum = await findAlbum(parsed.data.albumId);

    if (!targetAlbum) {
      return invalidAlbumState();
    }

    const updatedMedia = await prisma.$transaction(async (transaction) => {
      const media = await transaction.galleryMedia.update({
        where: {
          id: currentMedia.id,
        },
        data: {
          albumId: targetAlbum.id,
          mediaType: parsed.data.mediaType,
          fileUrl: parsed.data.fileUrl,
          thumbnailUrl: parsed.data.thumbnailUrl,
          caption: parsed.data.caption,
          altText: parsed.data.altText,
          sortOrder: parsed.data.sortOrder,
        },
        select: galleryMediaSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_MEDIA_UPDATED",
          entity: "GalleryMedia",
          entityId: currentMedia.id,
          oldValue: toMediaAuditValue(currentMedia),
          newValue: toMediaAuditValue(media),
        },
      });

      return media;
    });

    revalidateGalleryPaths([currentMedia.album.slug, targetAlbum.slug]);

    return {
      status: "success",
      message: "Media galeri berhasil diperbarui.",
      mediaId: updatedMedia.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui media galeri.", error);

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidAlbumState();
    }

    return {
      status: "error",
      message: "Media galeri gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteGalleryMediaAction(
  _previousState: GalleryMediaActionState,
  formData: FormData,
): Promise<GalleryMediaActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryMediaIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID media galeri tidak valid.",
    };
  }

  try {
    const currentMedia = await prisma.galleryMedia.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: {
        ...galleryMediaSelect,
        album: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!currentMedia) {
      return {
        status: "error",
        message: "Media galeri tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.galleryMedia.delete({
        where: {
          id: currentMedia.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "GALLERY_MEDIA_DELETED",
          entity: "GalleryMedia",
          entityId: currentMedia.id,
          oldValue: toMediaAuditValue(currentMedia),
        },
      });
    });

    revalidateGalleryPaths([currentMedia.album.slug]);

    return {
      status: "success",
      message: "Media galeri berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus media galeri.", error);

    return {
      status: "error",
      message: "Media galeri gagal dihapus. Silakan coba kembali.",
    };
  }
}
