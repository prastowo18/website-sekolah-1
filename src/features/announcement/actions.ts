"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

import { announcementFormSchema, announcementIdSchema } from "./schemas";
import type { AnnouncementActionState, AnnouncementFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const announcementSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  priority: true,
  attachmentUrl: true,
  startDate: true,
  endDate: true,
  isPinned: true,
  isActive: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

type AnnouncementRecord = {
  id: string;
  title: string;
  slug: string;
  content: string;
  priority: string;
  attachmentUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isPinned: boolean;
  isActive: boolean;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function getFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    content: formData.get("content") ?? "",
    priority: formData.get("priority"),
    attachmentUrl: formData.get("attachmentUrl") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    isPinned: formData.get("isPinned") ?? "",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): AnnouncementActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data pengumuman.",
    fieldErrors: errors as Partial<Record<AnnouncementFieldName, string[]>>,
  };
}

function invalidSlugState(): AnnouncementActionState {
  return {
    status: "error",
    message: "Slug pengumuman tidak valid.",
    fieldErrors: {
      slug: ["Gunakan judul atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): AnnouncementActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh pengumuman lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
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

function toAuditValue(announcement: AnnouncementRecord) {
  return {
    ...announcement,
    startDate: announcement.startDate?.toISOString() ?? null,
    endDate: announcement.endDate?.toISOString() ?? null,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString(),
  };
}

function revalidateAnnouncementPaths(
  slugs: Array<string | null | undefined>,
): void {
  revalidatePath("/");
  revalidatePath("/pengumuman");
  revalidatePath("/admin/pengumuman");
  revalidatePath("/admin/dashboard");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/pengumuman/${slug}`);
    }
  }
}

export async function createAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = announcementFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const createdAnnouncement = await prisma.$transaction(
      async (transaction) => {
        const announcement = await transaction.announcement.create({
          data: {
            title: parsed.data.title,
            slug,
            content: parsed.data.content,
            priority: parsed.data.priority,
            attachmentUrl: parsed.data.attachmentUrl,
            startDate: parsed.data.startDate,
            endDate: parsed.data.endDate,
            isPinned: parsed.data.isPinned,
            isActive: parsed.data.isActive,
            createdById: session.user.id,
          },
          select: announcementSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "ANNOUNCEMENT_CREATED",
            entity: "Announcement",
            entityId: announcement.id,
            newValue: toAuditValue(announcement),
          },
        });

        return announcement;
      },
    );

    revalidateAnnouncementPaths([createdAnnouncement.slug]);

    return {
      status: "success",
      message: "Pengumuman berhasil ditambahkan.",
      announcementId: createdAnnouncement.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan pengumuman.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Pengumuman gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = announcementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID pengumuman tidak valid.",
    };
  }

  const parsed = announcementFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.title);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const currentAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: announcementSelect,
    });

    if (!currentAnnouncement) {
      return {
        status: "error",
        message: "Pengumuman tidak ditemukan.",
      };
    }

    const updatedAnnouncement = await prisma.$transaction(
      async (transaction) => {
        const announcement = await transaction.announcement.update({
          where: {
            id: currentAnnouncement.id,
          },
          data: {
            title: parsed.data.title,
            slug,
            content: parsed.data.content,
            priority: parsed.data.priority,
            attachmentUrl: parsed.data.attachmentUrl,
            startDate: parsed.data.startDate,
            endDate: parsed.data.endDate,
            isPinned: parsed.data.isPinned,
            isActive: parsed.data.isActive,
          },
          select: announcementSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "ANNOUNCEMENT_UPDATED",
            entity: "Announcement",
            entityId: currentAnnouncement.id,
            oldValue: toAuditValue(currentAnnouncement),
            newValue: toAuditValue(announcement),
          },
        });

        return announcement;
      },
    );

    revalidateAnnouncementPaths([
      currentAnnouncement.slug,
      updatedAnnouncement.slug,
    ]);

    return {
      status: "success",
      message: "Pengumuman berhasil diperbarui.",
      announcementId: updatedAnnouncement.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui pengumuman.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Pengumuman gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteAnnouncementAction(
  _previousState: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = announcementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID pengumuman tidak valid.",
    };
  }

  try {
    const currentAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: announcementSelect,
    });

    if (!currentAnnouncement) {
      return {
        status: "error",
        message: "Pengumuman tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.announcement.delete({
        where: {
          id: currentAnnouncement.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ANNOUNCEMENT_DELETED",
          entity: "Announcement",
          entityId: currentAnnouncement.id,
          oldValue: toAuditValue(currentAnnouncement),
        },
      });
    });

    revalidateAnnouncementPaths([currentAnnouncement.slug]);

    return {
      status: "success",
      message: "Pengumuman berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus pengumuman.", error);

    return {
      status: "error",
      message: "Pengumuman gagal dihapus. Silakan coba kembali.",
    };
  }
}
