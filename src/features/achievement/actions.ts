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

import { achievementFormSchema, achievementIdSchema } from "./schemas";
import type { AchievementActionState, AchievementFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const ACHIEVEMENT_MEDIA_PREFIX = "achievements/";

const achievementSelect = {
  id: true,
  title: true,
  slug: true,
  achievementType: true,
  category: true,
  winnerName: true,
  competitionLevel: true,
  rank: true,
  achievementDate: true,
  description: true,
  imageUrl: true,
  isPublished: true,
  publishedAt: true,
} satisfies Prisma.AchievementSelect;

type AchievementRecord = Prisma.AchievementGetPayload<{
  select: typeof achievementSelect;
}>;

function toAuditValue(achievement: AchievementRecord) {
  return {
    ...achievement,
    achievementDate:
      achievement.achievementDate?.toISOString().slice(0, 10) ?? null,
    publishedAt: achievement.publishedAt?.toISOString() ?? null,
  };
}

function getFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    achievementType: formData.get("achievementType"),
    category: formData.get("category") ?? "",
    winnerName: formData.get("winnerName") ?? "",
    competitionLevel: formData.get("competitionLevel") ?? "",
    rank: formData.get("rank") ?? "",
    achievementDate: formData.get("achievementDate") ?? "",
    description: formData.get("description") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    isPublished: formData.get("isPublished") ?? "",
  };
}

function validationErrorState(error: z.ZodError): AchievementActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data prestasi.",
    fieldErrors: errors as Partial<Record<AchievementFieldName, string[]>>,
  };
}

function invalidSlugState(): AchievementActionState {
  return {
    status: "error",
    message: "Slug prestasi tidak valid.",
    fieldErrors: {
      slug: ["Gunakan judul atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): AchievementActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh prestasi lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidPendingImageState(message: string): AchievementActionState {
  return {
    status: "error",
    message: "Gambar prestasi belum dapat diterapkan.",
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

function revalidateAchievementPaths(
  slugs: Array<string | null | undefined> = [],
): void {
  revalidatePath("/");
  revalidatePath("/prestasi");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
  revalidatePath("/konsol-8m4q7x2k9v6d/prestasi");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/prestasi/${slug}`);
    }
  }
}

async function cleanupAchievementImage({
  previousUrl,
  nextUrl = null,
}: {
  previousUrl: string | null | undefined;
  nextUrl?: string | null | undefined;
}): Promise<void> {
  const previousKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!previousKey || !previousKey.startsWith(ACHIEVEMENT_MEDIA_PREFIX)) {
    return;
  }

  const nextKey = getR2ObjectKeyFromPublicUrl(nextUrl);

  if (nextKey === previousKey) {
    return;
  }

  try {
    await deleteR2ObjectByKey(previousKey);
  } catch (error) {
    console.error("Gagal menghapus gambar prestasi lama dari R2.", {
      objectKey: previousKey,
      error,
    });
  }
}

export async function createAchievementAction(
  _previousState: AchievementActionState,
  formData: FormData,
): Promise<AchievementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = achievementFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;

  let databaseCommitted = false;

  try {
    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "achievements",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const createdAchievement = await prisma.$transaction(
      async (transaction) => {
        const achievement = await transaction.achievement.create({
          data: {
            title: parsed.data.title,
            slug,
            achievementType: parsed.data.achievementType,
            category: parsed.data.category,
            winnerName: parsed.data.winnerName,
            competitionLevel: parsed.data.competitionLevel,
            rank: parsed.data.rank,
            achievementDate: parsed.data.achievementDate,
            description: parsed.data.description,
            imageUrl,
            isPublished: parsed.data.isPublished,
            publishedAt: parsed.data.isPublished ? new Date() : null,
          },
          select: achievementSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "ACHIEVEMENT_CREATED",
            entity: "Achievement",
            entityId: achievement.id,
            newValue: toAuditValue(achievement),
          },
        });

        return achievement;
      },
    );

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedImage);

    revalidateAchievementPaths([createdAchievement.slug]);

    return {
      status: "success",
      message: "Prestasi berhasil ditambahkan.",
      achievementId: createdAchievement.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal menambahkan prestasi.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Prestasi gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateAchievementAction(
  _previousState: AchievementActionState,
  formData: FormData,
): Promise<AchievementActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = achievementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID prestasi tidak valid.",
    };
  }

  const parsed = achievementFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;

  let databaseCommitted = false;

  try {
    const currentAchievement = await prisma.achievement.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: achievementSelect,
    });

    if (!currentAchievement) {
      return {
        status: "error",
        message: "Data prestasi tidak ditemukan.",
      };
    }

    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "achievements",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const updatedAchievement = await prisma.$transaction(
      async (transaction) => {
        const achievement = await transaction.achievement.update({
          where: {
            id: currentAchievement.id,
          },
          data: {
            title: parsed.data.title,
            slug,
            achievementType: parsed.data.achievementType,
            category: parsed.data.category,
            winnerName: parsed.data.winnerName,
            competitionLevel: parsed.data.competitionLevel,
            rank: parsed.data.rank,
            achievementDate: parsed.data.achievementDate,
            description: parsed.data.description,
            imageUrl,
            isPublished: parsed.data.isPublished,
            publishedAt: parsed.data.isPublished
              ? (currentAchievement.publishedAt ?? new Date())
              : null,
          },
          select: achievementSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "ACHIEVEMENT_UPDATED",
            entity: "Achievement",
            entityId: currentAchievement.id,
            oldValue: toAuditValue(currentAchievement),
            newValue: toAuditValue(achievement),
          },
        });

        return achievement;
      },
    );

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedImage);

    await cleanupAchievementImage({
      previousUrl: currentAchievement.imageUrl,
      nextUrl: updatedAchievement.imageUrl,
    });

    revalidateAchievementPaths([
      currentAchievement.slug,
      updatedAchievement.slug,
    ]);

    return {
      status: "success",
      message: "Prestasi berhasil diperbarui.",
      achievementId: updatedAchievement.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal memperbarui prestasi.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Prestasi gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteAchievementAction(
  _previousState: AchievementActionState,
  formData: FormData,
): Promise<AchievementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = achievementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID prestasi tidak valid.",
    };
  }

  try {
    const currentAchievement = await prisma.achievement.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: achievementSelect,
    });

    if (!currentAchievement) {
      return {
        status: "error",
        message: "Data prestasi tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.achievement.delete({
        where: {
          id: currentAchievement.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ACHIEVEMENT_DELETED",
          entity: "Achievement",
          entityId: currentAchievement.id,
          oldValue: toAuditValue(currentAchievement),
        },
      });
    });

    await cleanupAchievementImage({
      previousUrl: currentAchievement.imageUrl,
    });

    revalidateAchievementPaths([currentAchievement.slug]);

    return {
      status: "success",
      message: "Prestasi berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus prestasi.", error);

    return {
      status: "error",
      message: "Prestasi gagal dihapus. Silakan coba kembali.",
    };
  }
}
