"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
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

import { extracurricularFormSchema, extracurricularIdSchema } from "./schemas";
import type {
  ExtracurricularActionState,
  ExtracurricularFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const EXTRACURRICULAR_MEDIA_PREFIX = "extracurriculars/";

const extracurricularSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  schedule: true,
  coach: true,
  targetClasses: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
} as const;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    schedule: formData.get("schedule") ?? "",
    coach: formData.get("coach") ?? "",
    targetClasses: formData.get("targetClasses") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): ExtracurricularActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data ekstrakurikuler.",
    fieldErrors: errors as Partial<Record<ExtracurricularFieldName, string[]>>,
  };
}

function invalidSlugState(): ExtracurricularActionState {
  return {
    status: "error",
    message: "Slug ekstrakurikuler tidak valid.",
    fieldErrors: {
      slug: ["Gunakan nama atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): ExtracurricularActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh ekstrakurikuler lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidPendingImageState(message: string): ExtracurricularActionState {
  return {
    status: "error",
    message: "Gambar ekstrakurikuler belum dapat diterapkan.",
    fieldErrors: {
      imageUrl: [message],
    },
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function revalidateExtracurricularPaths(
  slugs: Array<string | null | undefined> = [],
): void {
  revalidatePath("/");
  revalidatePath("/ekstrakurikuler");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
  revalidatePath("/konsol-8m4q7x2k9v6d/ekstrakurikuler");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/ekstrakurikuler/${slug}`);
    }
  }
}

async function completePendingImage(
  preparedImage: PreparedMediaCommit | null,
): Promise<void> {
  try {
    await completePreparedMediaCommit(preparedImage);
  } catch (error) {
    console.error(
      "Database tersimpan, tetapi object pending ekstrakurikuler belum dapat dibersihkan.",
      error,
    );
  }
}

async function cleanupExtracurricularImage({
  previousUrl,
  nextUrl = null,
}: {
  previousUrl: string | null | undefined;
  nextUrl?: string | null | undefined;
}): Promise<void> {
  const previousKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!previousKey || !previousKey.startsWith(EXTRACURRICULAR_MEDIA_PREFIX)) {
    return;
  }

  const nextKey = getR2ObjectKeyFromPublicUrl(nextUrl);

  if (nextKey === previousKey) {
    return;
  }

  try {
    await deleteR2ObjectByKey(previousKey);
  } catch (error) {
    console.error("Gagal menghapus gambar ekstrakurikuler lama dari R2.", {
      objectKey: previousKey,
      error,
    });
  }
}

export async function createExtracurricularAction(
  _previousState: ExtracurricularActionState,
  formData: FormData,
): Promise<ExtracurricularActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = extracurricularFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "extracurriculars",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const createdExtracurricular = await prisma.$transaction(
      async (transaction) => {
        const extracurricular = await transaction.extracurricular.create({
          data: {
            name: parsed.data.name,
            slug,
            description: parsed.data.description,
            schedule: parsed.data.schedule,
            coach: parsed.data.coach,
            targetClasses: parsed.data.targetClasses,
            imageUrl,
            sortOrder: parsed.data.sortOrder,
            isActive: parsed.data.isActive,
          },
          select: extracurricularSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "EXTRACURRICULAR_CREATED",
            entity: "Extracurricular",
            entityId: extracurricular.id,
            newValue: extracurricular,
          },
        });

        return extracurricular;
      },
    );

    databaseCommitted = true;

    await completePendingImage(preparedImage);

    revalidateExtracurricularPaths([createdExtracurricular.slug]);

    return {
      status: "success",
      message: "Ekstrakurikuler berhasil ditambahkan.",
      extracurricularId: createdExtracurricular.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal menambahkan ekstrakurikuler.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Ekstrakurikuler gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateExtracurricularAction(
  _previousState: ExtracurricularActionState,
  formData: FormData,
): Promise<ExtracurricularActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = extracurricularIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID ekstrakurikuler tidak valid.",
    };
  }

  const parsed = extracurricularFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    const currentExtracurricular = await prisma.extracurricular.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: extracurricularSelect,
    });

    if (!currentExtracurricular) {
      return {
        status: "error",
        message: "Data ekstrakurikuler tidak ditemukan.",
      };
    }

    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "extracurriculars",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const updatedExtracurricular = await prisma.$transaction(
      async (transaction) => {
        const extracurricular = await transaction.extracurricular.update({
          where: {
            id: currentExtracurricular.id,
          },
          data: {
            name: parsed.data.name,
            slug,
            description: parsed.data.description,
            schedule: parsed.data.schedule,
            coach: parsed.data.coach,
            targetClasses: parsed.data.targetClasses,
            imageUrl,
            sortOrder: parsed.data.sortOrder,
            isActive: parsed.data.isActive,
          },
          select: extracurricularSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "EXTRACURRICULAR_UPDATED",
            entity: "Extracurricular",
            entityId: currentExtracurricular.id,
            oldValue: currentExtracurricular,
            newValue: extracurricular,
          },
        });

        return extracurricular;
      },
    );

    databaseCommitted = true;

    await completePendingImage(preparedImage);

    await cleanupExtracurricularImage({
      previousUrl: currentExtracurricular.imageUrl,
      nextUrl: updatedExtracurricular.imageUrl,
    });

    revalidateExtracurricularPaths([
      currentExtracurricular.slug,
      updatedExtracurricular.slug,
    ]);

    return {
      status: "success",
      message: "Ekstrakurikuler berhasil diperbarui.",
      extracurricularId: updatedExtracurricular.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal memperbarui ekstrakurikuler.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Ekstrakurikuler gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteExtracurricularAction(
  _previousState: ExtracurricularActionState,
  formData: FormData,
): Promise<ExtracurricularActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = extracurricularIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID ekstrakurikuler tidak valid.",
    };
  }

  try {
    const currentExtracurricular = await prisma.extracurricular.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: extracurricularSelect,
    });

    if (!currentExtracurricular) {
      return {
        status: "error",
        message: "Data ekstrakurikuler tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.extracurricular.delete({
        where: {
          id: currentExtracurricular.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "EXTRACURRICULAR_DELETED",
          entity: "Extracurricular",
          entityId: currentExtracurricular.id,
          oldValue: currentExtracurricular,
        },
      });
    });

    await cleanupExtracurricularImage({
      previousUrl: currentExtracurricular.imageUrl,
    });

    revalidateExtracurricularPaths([currentExtracurricular.slug]);

    return {
      status: "success",
      message: "Ekstrakurikuler berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus ekstrakurikuler.", error);

    return {
      status: "error",
      message: "Ekstrakurikuler gagal dihapus. Silakan coba kembali.",
    };
  }
}
