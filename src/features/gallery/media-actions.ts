"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  type Prisma,
  UserRole,
} from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
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

import {
  galleryMediaFormSchema,
  galleryMediaIdSchema,
} from "./schemas";
import type {
  GalleryMediaActionState,
  GalleryMediaFieldName,
} from "./types";

const editableRoles = [
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
] as const;

const GALLERY_MEDIA_PREFIX = "galleries/";

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

type GalleryMediaRecord =
  Prisma.GalleryMediaGetPayload<{
    select: typeof galleryMediaSelect;
  }>;

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

function validationErrorState(
  error: z.ZodError,
): GalleryMediaActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data media galeri.",
    fieldErrors: errors as Partial<
      Record<GalleryMediaFieldName, string[]>
    >,
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

function invalidPendingMediaState(
  field: "fileUrl" | "thumbnailUrl",
  message: string,
): GalleryMediaActionState {
  return {
    status: "error",
    message:
      field === "fileUrl"
        ? "File media belum dapat diterapkan."
        : "Thumbnail belum dapat diterapkan.",
    fieldErrors: {
      [field]: [message],
    },
  };
}

function hasPrismaErrorCode(
  error: unknown,
  code: string,
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function toAuditValue(media: GalleryMediaRecord) {
  return {
    ...media,
    createdAt: media.createdAt.toISOString(),
    updatedAt: media.updatedAt.toISOString(),
  };
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

function revalidateGalleryPaths(
  slugs: Array<string | null | undefined>,
): void {
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

async function cleanupReplacedMediaObjects({
  previousUrls,
  nextUrls,
}: {
  previousUrls: Array<string | null | undefined>;
  nextUrls: Array<string | null | undefined>;
}): Promise<void> {
  const nextKeys = new Set<string>();

  for (const url of nextUrls) {
    const objectKey = getR2ObjectKeyFromPublicUrl(url);

    if (
      objectKey &&
      objectKey.startsWith(GALLERY_MEDIA_PREFIX)
    ) {
      nextKeys.add(objectKey);
    }
  }

  const previousKeys = new Set<string>();

  for (const url of previousUrls) {
    const objectKey = getR2ObjectKeyFromPublicUrl(url);

    if (
      objectKey &&
      objectKey.startsWith(GALLERY_MEDIA_PREFIX) &&
      !nextKeys.has(objectKey)
    ) {
      previousKeys.add(objectKey);
    }
  }

  const objectKeys = Array.from(previousKeys);

  const results = await Promise.allSettled(
    objectKeys.map((objectKey) =>
      deleteR2ObjectByKey(objectKey),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        "Gagal membersihkan object media galeri dari R2.",
        {
          objectKey: objectKeys[index],
          error: result.reason,
        },
      );
    }
  });
}

async function completePreparedCommits(
  preparedFile: PreparedMediaCommit | null,
  preparedThumbnail: PreparedMediaCommit | null,
): Promise<void> {
  await completePreparedMediaCommit(preparedFile);
  await completePreparedMediaCommit(preparedThumbnail);
}

async function rollbackPreparedCommits(
  preparedFile: PreparedMediaCommit | null,
  preparedThumbnail: PreparedMediaCommit | null,
): Promise<void> {
  await rollbackPreparedMediaCommit(preparedFile);
  await rollbackPreparedMediaCommit(preparedThumbnail);
}

export async function createGalleryMediaAction(
  _previousState: GalleryMediaActionState,
  formData: FormData,
): Promise<GalleryMediaActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = galleryMediaFormSchema.safeParse(
    getMediaFormValues(formData),
  );

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const album = await findAlbum(parsed.data.albumId);

  if (!album) {
    return invalidAlbumState();
  }

  let preparedFile: PreparedMediaCommit | null = null;
  let preparedThumbnail: PreparedMediaCommit | null = null;

  let pendingField: "fileUrl" | "thumbnailUrl" = "fileUrl";
  let databaseCommitted = false;

  try {
    pendingField = "fileUrl";

    preparedFile = await preparePendingMediaCommit(
      parsed.data.fileUrl,
      "galleries",
    );

    if (parsed.data.mediaType !== "IMAGE") {
      pendingField = "thumbnailUrl";

      preparedThumbnail = await preparePendingMediaCommit(
        parsed.data.thumbnailUrl,
        "galleries",
      );
    }

    const fileUrl =
      preparedFile?.finalUrl ?? parsed.data.fileUrl;

    const thumbnailUrl =
      parsed.data.mediaType === "IMAGE"
        ? null
        : (preparedThumbnail?.finalUrl ??
          parsed.data.thumbnailUrl);

    const createdMedia = await prisma.$transaction(
      async (transaction) => {
        const media = await transaction.galleryMedia.create({
          data: {
            albumId: album.id,
            mediaType: parsed.data.mediaType,
            fileUrl,
            thumbnailUrl,
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
            newValue: toAuditValue(media),
          },
        });

        return media;
      },
    );

    databaseCommitted = true;

    await completePreparedCommits(
      preparedFile,
      preparedThumbnail,
    );

    revalidateGalleryPaths([album.slug]);

    return {
      status: "success",
      message: "Media galeri berhasil ditambahkan.",
      mediaId: createdMedia.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedCommits(
        preparedFile,
        preparedThumbnail,
      );
    }

    console.error("Gagal menambahkan media galeri.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingMediaState(
        pendingField,
        error.message,
      );
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidAlbumState();
    }

    return {
      status: "error",
      message:
        "Media galeri gagal ditambahkan. Silakan coba kembali.",
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

  const parsed = galleryMediaFormSchema.safeParse(
    getMediaFormValues(formData),
  );

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

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

  let preparedFile: PreparedMediaCommit | null = null;
  let preparedThumbnail: PreparedMediaCommit | null = null;

  let pendingField: "fileUrl" | "thumbnailUrl" = "fileUrl";
  let databaseCommitted = false;

  try {
    pendingField = "fileUrl";

    preparedFile = await preparePendingMediaCommit(
      parsed.data.fileUrl,
      "galleries",
    );

    if (parsed.data.mediaType !== "IMAGE") {
      pendingField = "thumbnailUrl";

      preparedThumbnail = await preparePendingMediaCommit(
        parsed.data.thumbnailUrl,
        "galleries",
      );
    }

    const fileUrl =
      preparedFile?.finalUrl ?? parsed.data.fileUrl;

    const thumbnailUrl =
      parsed.data.mediaType === "IMAGE"
        ? null
        : (preparedThumbnail?.finalUrl ??
          parsed.data.thumbnailUrl);

    const updatedMedia = await prisma.$transaction(
      async (transaction) => {
        const media = await transaction.galleryMedia.update({
          where: {
            id: currentMedia.id,
          },
          data: {
            albumId: targetAlbum.id,
            mediaType: parsed.data.mediaType,
            fileUrl,
            thumbnailUrl,
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
            oldValue: toAuditValue(currentMedia),
            newValue: toAuditValue(media),
          },
        });

        return media;
      },
    );

    databaseCommitted = true;

    await completePreparedCommits(
      preparedFile,
      preparedThumbnail,
    );

    await cleanupReplacedMediaObjects({
      previousUrls: [
        currentMedia.fileUrl,
        currentMedia.thumbnailUrl,
      ],
      nextUrls: [
        updatedMedia.fileUrl,
        updatedMedia.thumbnailUrl,
      ],
    });

    revalidateGalleryPaths([
      currentMedia.album.slug,
      targetAlbum.slug,
    ]);

    return {
      status: "success",
      message: "Media galeri berhasil diperbarui.",
      mediaId: updatedMedia.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedCommits(
        preparedFile,
        preparedThumbnail,
      );
    }

    console.error("Gagal memperbarui media galeri.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingMediaState(
        pendingField,
        error.message,
      );
    }

    if (hasPrismaErrorCode(error, "P2003")) {
      return invalidAlbumState();
    }

    return {
      status: "error",
      message:
        "Media galeri gagal diperbarui. Silakan coba kembali.",
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
          oldValue: toAuditValue(currentMedia),
        },
      });
    });

    await cleanupReplacedMediaObjects({
      previousUrls: [
        currentMedia.fileUrl,
        currentMedia.thumbnailUrl,
      ],
      nextUrls: [],
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
      message:
        "Media galeri gagal dihapus. Silakan coba kembali.",
    };
  }
}
