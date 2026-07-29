"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { faqFormSchema, faqIdSchema } from "./schemas";
import type { FaqActionState, FaqFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const faqSelect = {
  id: true,
  question: true,
  answer: true,
  category: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FaqSelect;

type FaqRecord = Prisma.FaqGetPayload<{
  select: typeof faqSelect;
}>;

function getFormValues(formData: FormData) {
  return {
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): FaqActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data FAQ.",
    fieldErrors: errors as Partial<Record<FaqFieldName, string[]>>,
  };
}

function toAuditValue(faq: FaqRecord) {
  return {
    ...faq,
    createdAt: faq.createdAt.toISOString(),
    updatedAt: faq.updatedAt.toISOString(),
  };
}

function revalidateFaqPaths(): void {
  revalidatePath("/");
  revalidatePath("/faq");
  revalidatePath("/konsol-8m4q7x2k9v6d/faq");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
}

export async function createFaqAction(
  _previousState: FaqActionState,
  formData: FormData,
): Promise<FaqActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = faqFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const createdFaq = await prisma.$transaction(async (transaction) => {
      const faq = await transaction.faq.create({
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          category: parsed.data.category,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: faqSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FAQ_CREATED",
          entity: "Faq",
          entityId: faq.id,
          newValue: toAuditValue(faq),
        },
      });

      return faq;
    });

    revalidateFaqPaths();

    return {
      status: "success",
      message: "FAQ berhasil ditambahkan.",
      faqId: createdFaq.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan FAQ.", error);

    return {
      status: "error",
      message: "FAQ gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateFaqAction(
  _previousState: FaqActionState,
  formData: FormData,
): Promise<FaqActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = faqIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID FAQ tidak valid.",
    };
  }

  const parsed = faqFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const currentFaq = await prisma.faq.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: faqSelect,
    });

    if (!currentFaq) {
      return {
        status: "error",
        message: "FAQ tidak ditemukan.",
      };
    }

    const updatedFaq = await prisma.$transaction(async (transaction) => {
      const faq = await transaction.faq.update({
        where: {
          id: currentFaq.id,
        },
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          category: parsed.data.category,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: faqSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FAQ_UPDATED",
          entity: "Faq",
          entityId: currentFaq.id,
          oldValue: toAuditValue(currentFaq),
          newValue: toAuditValue(faq),
        },
      });

      return faq;
    });

    revalidateFaqPaths();

    return {
      status: "success",
      message: "FAQ berhasil diperbarui.",
      faqId: updatedFaq.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui FAQ.", error);

    return {
      status: "error",
      message: "FAQ gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteFaqAction(
  _previousState: FaqActionState,
  formData: FormData,
): Promise<FaqActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = faqIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID FAQ tidak valid.",
    };
  }

  try {
    const currentFaq = await prisma.faq.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: faqSelect,
    });

    if (!currentFaq) {
      return {
        status: "error",
        message: "FAQ tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.faq.delete({
        where: {
          id: currentFaq.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FAQ_DELETED",
          entity: "Faq",
          entityId: currentFaq.id,
          oldValue: toAuditValue(currentFaq),
        },
      });
    });

    revalidateFaqPaths();

    return {
      status: "success",
      message: "FAQ berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus FAQ.", error);

    return {
      status: "error",
      message: "FAQ gagal dihapus. Silakan coba kembali.",
    };
  }
}
