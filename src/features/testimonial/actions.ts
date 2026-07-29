"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { testimonialFormSchema, testimonialIdSchema } from "./schemas";
import type { TestimonialActionState, TestimonialFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const testimonialSelect = {
  id: true,
  name: true,
  role: true,
  content: true,
  photoUrl: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TestimonialSelect;

type TestimonialRecord = Prisma.TestimonialGetPayload<{
  select: typeof testimonialSelect;
}>;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    role: formData.get("role") ?? "",
    content: formData.get("content"),
    photoUrl: formData.get("photoUrl") ?? "",
    isPublished: formData.get("isPublished") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  };
}

function validationErrorState(error: z.ZodError): TestimonialActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data testimoni.",
    fieldErrors: errors as Partial<Record<TestimonialFieldName, string[]>>,
  };
}

function toAuditValue(testimonial: TestimonialRecord) {
  return {
    ...testimonial,
    createdAt: testimonial.createdAt.toISOString(),
    updatedAt: testimonial.updatedAt.toISOString(),
  };
}

function revalidateTestimonialPaths(): void {
  revalidatePath("/");
  revalidatePath("/testimoni");
  revalidatePath("/konsol-8m4q7x2k9v6d/testimoni");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
}

export async function createTestimonialAction(
  _previousState: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = testimonialFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const createdTestimonial = await prisma.$transaction(
      async (transaction) => {
        const testimonial = await transaction.testimonial.create({
          data: {
            name: parsed.data.name,
            role: parsed.data.role,
            content: parsed.data.content,
            photoUrl: parsed.data.photoUrl,
            isPublished: parsed.data.isPublished,
            sortOrder: parsed.data.sortOrder,
          },
          select: testimonialSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "TESTIMONIAL_CREATED",
            entity: "Testimonial",
            entityId: testimonial.id,
            newValue: toAuditValue(testimonial),
          },
        });

        return testimonial;
      },
    );

    revalidateTestimonialPaths();

    return {
      status: "success",
      message: createdTestimonial.isPublished
        ? "Testimoni berhasil ditambahkan dan dipublikasikan."
        : "Testimoni berhasil disimpan sebagai belum dipublikasikan.",
      testimonialId: createdTestimonial.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan testimoni.", error);

    return {
      status: "error",
      message: "Testimoni gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateTestimonialAction(
  _previousState: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = testimonialIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID testimoni tidak valid.",
    };
  }

  const parsed = testimonialFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  try {
    const currentTestimonial = await prisma.testimonial.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: testimonialSelect,
    });

    if (!currentTestimonial) {
      return {
        status: "error",
        message: "Testimoni tidak ditemukan.",
      };
    }

    const updatedTestimonial = await prisma.$transaction(
      async (transaction) => {
        const testimonial = await transaction.testimonial.update({
          where: {
            id: currentTestimonial.id,
          },
          data: {
            name: parsed.data.name,
            role: parsed.data.role,
            content: parsed.data.content,
            photoUrl: parsed.data.photoUrl,
            isPublished: parsed.data.isPublished,
            sortOrder: parsed.data.sortOrder,
          },
          select: testimonialSelect,
        });

        await transaction.auditLog.create({
          data: {
            actorId: session.user.id,
            action: "TESTIMONIAL_UPDATED",
            entity: "Testimonial",
            entityId: currentTestimonial.id,
            oldValue: toAuditValue(currentTestimonial),
            newValue: toAuditValue(testimonial),
          },
        });

        return testimonial;
      },
    );

    revalidateTestimonialPaths();

    return {
      status: "success",
      message: updatedTestimonial.isPublished
        ? "Testimoni berhasil diperbarui dan dipublikasikan."
        : "Testimoni berhasil diperbarui.",
      testimonialId: updatedTestimonial.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui testimoni.", error);

    return {
      status: "error",
      message: "Testimoni gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteTestimonialAction(
  _previousState: TestimonialActionState,
  formData: FormData,
): Promise<TestimonialActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = testimonialIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID testimoni tidak valid.",
    };
  }

  try {
    const currentTestimonial = await prisma.testimonial.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: testimonialSelect,
    });

    if (!currentTestimonial) {
      return {
        status: "error",
        message: "Testimoni tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.testimonial.delete({
        where: {
          id: currentTestimonial.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "TESTIMONIAL_DELETED",
          entity: "Testimonial",
          entityId: currentTestimonial.id,
          oldValue: toAuditValue(currentTestimonial),
        },
      });
    });

    revalidateTestimonialPaths();

    return {
      status: "success",
      message: "Testimoni berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus testimoni.", error);

    return {
      status: "error",
      message: "Testimoni gagal dihapus. Silakan coba kembali.",
    };
  }
}
