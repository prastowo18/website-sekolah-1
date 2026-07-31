"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { getSocialLinkIconName } from "./constants";
import { socialLinkFormSchema, socialLinkIdSchema } from "./schemas";
import type { SocialLinkActionState, SocialLinkFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const socialLinkSelect = {
  id: true,
  platform: true,
  label: true,
  url: true,
  icon: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SocialLinkSelect;

type SocialLinkRecord = Prisma.SocialLinkGetPayload<{
  select: typeof socialLinkSelect;
}>;

function getFormValues(formData: FormData) {
  return {
    platform: formData.get("platform"),
    label: formData.get("label") ?? "",
    url: formData.get("url"),
    sortOrder: formData.get("sortOrder") ?? "0",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): SocialLinkActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data media sosial.",
    fieldErrors: errors as Partial<Record<SocialLinkFieldName, string[]>>,
  };
}

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toAuditValue(record: SocialLinkRecord) {
  return {
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function revalidateSocialLinkPaths(): void {
  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/kontak");
  revalidatePath("/konsol-8m4q7x2k9v6d/media-sosial");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
}

export async function createSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = socialLinkFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const createdLink = await prisma.$transaction(async (transaction) => {
      const link = await transaction.socialLink.create({
        data: {
          platform: parsed.data.platform,
          label: parsed.data.label,
          url: parsed.data.url,
          icon: getSocialLinkIconName(parsed.data.platform),
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: socialLinkSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SOCIAL_LINK_CREATED",
          entity: "SocialLink",
          entityId: link.id,
          newValue: toAuditValue(link),
        },
      });

      return link;
    });

    revalidateSocialLinkPaths();

    return {
      status: "success",
      message: "Media sosial berhasil ditambahkan.",
      socialLinkId: createdLink.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan media sosial.", error);

    if (isPrismaUniqueError(error)) {
      return {
        status: "error",
        message: "Platform tersebut sudah terdaftar.",
        fieldErrors: {
          platform: ["Satu platform hanya dapat dibuat satu kali."],
        },
      };
    }

    return {
      status: "error",
      message: "Media sosial gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = socialLinkIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID media sosial tidak valid.",
    };
  }

  const parsed = socialLinkFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const currentLink = await prisma.socialLink.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: socialLinkSelect,
    });

    if (!currentLink) {
      return {
        status: "error",
        message: "Media sosial tidak ditemukan.",
      };
    }

    const updatedLink = await prisma.$transaction(async (transaction) => {
      const link = await transaction.socialLink.update({
        where: {
          id: currentLink.id,
        },
        data: {
          platform: parsed.data.platform,
          label: parsed.data.label,
          url: parsed.data.url,
          icon: getSocialLinkIconName(parsed.data.platform),
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: socialLinkSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SOCIAL_LINK_UPDATED",
          entity: "SocialLink",
          entityId: currentLink.id,
          oldValue: toAuditValue(currentLink),
          newValue: toAuditValue(link),
        },
      });

      return link;
    });

    revalidateSocialLinkPaths();

    return {
      status: "success",
      message: "Media sosial berhasil diperbarui.",
      socialLinkId: updatedLink.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui media sosial.", error);

    if (isPrismaUniqueError(error)) {
      return {
        status: "error",
        message: "Platform tersebut sudah digunakan.",
        fieldErrors: {
          platform: ["Gunakan platform yang belum terdaftar."],
        },
      };
    }

    return {
      status: "error",
      message: "Media sosial gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteSocialLinkAction(
  _previousState: SocialLinkActionState,
  formData: FormData,
): Promise<SocialLinkActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = socialLinkIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID media sosial tidak valid.",
    };
  }

  try {
    const currentLink = await prisma.socialLink.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: socialLinkSelect,
    });

    if (!currentLink) {
      return {
        status: "error",
        message: "Media sosial tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.socialLink.delete({
        where: {
          id: currentLink.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SOCIAL_LINK_DELETED",
          entity: "SocialLink",
          entityId: currentLink.id,
          oldValue: toAuditValue(currentLink),
        },
      });
    });

    revalidateSocialLinkPaths();

    return {
      status: "success",
      message: "Media sosial berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus media sosial.", error);

    return {
      status: "error",
      message: "Media sosial gagal dihapus. Silakan coba kembali.",
    };
  }
}
