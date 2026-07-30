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

import { teacherFormSchema, teacherIdSchema } from "./schemas";
import type { TeacherActionState, TeacherFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const TEACHER_MEDIA_PREFIX = "teachers/";

const teacherSelect = {
  id: true,
  name: true,
  slug: true,
  employeeNumber: true,
  position: true,
  subject: true,
  education: true,
  shortBiography: true,
  photoUrl: true,
  isPrincipal: true,
  isActive: true,
  sortOrder: true,
} as const;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    employeeNumber: formData.get("employeeNumber") ?? "",
    position: formData.get("position") ?? "",
    subject: formData.get("subject") ?? "",
    education: formData.get("education") ?? "",
    shortBiography: formData.get("shortBiography") ?? "",
    photoUrl: formData.get("photoUrl") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
    isPrincipal: formData.get("isPrincipal") ?? "",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): TeacherActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data guru.",
    fieldErrors: errors as Partial<Record<TeacherFieldName, string[]>>,
  };
}

function invalidSlugState(): TeacherActionState {
  return {
    status: "error",
    message: "Slug guru tidak valid.",
    fieldErrors: {
      slug: ["Gunakan nama atau slug yang mengandung huruf atau angka."],
    },
  };
}

function invalidPendingPhotoState(message: string): TeacherActionState {
  return {
    status: "error",
    message: "Foto guru belum dapat diterapkan.",
    fieldErrors: {
      photoUrl: [message],
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

function getUniqueTargets(error: unknown): string[] {
  if (typeof error !== "object" || error === null || !("meta" in error)) {
    return [];
  }

  const meta = error.meta;

  if (typeof meta !== "object" || meta === null || !("target" in meta)) {
    return [];
  }

  const target = meta.target;

  if (Array.isArray(target)) {
    return target.filter((item): item is string => typeof item === "string");
  }

  return typeof target === "string" ? [target] : [];
}

function uniqueConstraintState(error: unknown): TeacherActionState {
  const targets = getUniqueTargets(error).join(" ").toLowerCase();

  if (
    targets.includes("employeenumber") ||
    targets.includes("employee_number") ||
    targets.includes("employee")
  ) {
    return {
      status: "error",
      message: "Nomor pegawai sudah digunakan oleh guru lain.",
      fieldErrors: {
        employeeNumber: ["Gunakan nomor pegawai yang berbeda."],
      },
    };
  }

  if (targets.includes("slug")) {
    return {
      status: "error",
      message: "Slug sudah digunakan oleh guru lain.",
      fieldErrors: {
        slug: ["Gunakan slug yang berbeda."],
      },
    };
  }

  if (
    targets.includes("isprincipal") ||
    targets.includes("teacher_single_principal_idx")
  ) {
    return {
      status: "error",
      message: "Sekolah hanya boleh memiliki satu kepala sekolah.",
      fieldErrors: {
        isPrincipal: [
          "Kepala sekolah lain masih tercatat. Muat ulang halaman dan coba kembali.",
        ],
      },
    };
  }

  return {
    status: "error",
    message: "Slug atau nomor pegawai sudah digunakan oleh data lain.",
  };
}

function revalidateTeacherPaths(): void {
  revalidatePath("/");
  revalidatePath("/guru");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
  revalidatePath("/konsol-8m4q7x2k9v6d/guru");
  revalidatePath("/konsol-8m4q7x2k9v6d/profil-sekolah");
}

async function cleanupTeacherPhoto({
  previousUrl,
  nextUrl = null,
}: {
  previousUrl: string | null | undefined;
  nextUrl?: string | null | undefined;
}): Promise<void> {
  const previousKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!previousKey || !previousKey.startsWith(TEACHER_MEDIA_PREFIX)) {
    return;
  }

  const nextKey = getR2ObjectKeyFromPublicUrl(nextUrl);

  if (nextKey === previousKey) {
    return;
  }

  try {
    await deleteR2ObjectByKey(previousKey);
  } catch (error) {
    console.error("Gagal menghapus foto guru lama dari R2.", {
      objectKey: previousKey,
      error,
    });
  }
}

export async function createTeacherAction(
  _previousState: TeacherActionState,
  formData: FormData,
): Promise<TeacherActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = teacherFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedPhoto: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    preparedPhoto = await preparePendingMediaCommit(
      parsed.data.photoUrl,
      "teachers",
    );

    const photoUrl = preparedPhoto?.finalUrl ?? parsed.data.photoUrl;

    const createdTeacher = await prisma.$transaction(async (transaction) => {
      if (parsed.data.isPrincipal) {
        await transaction.teacher.updateMany({
          where: {
            isPrincipal: true,
          },
          data: {
            isPrincipal: false,
          },
        });
      }

      const teacher = await transaction.teacher.create({
        data: {
          name: parsed.data.name,
          slug,
          employeeNumber: parsed.data.employeeNumber,
          position: parsed.data.position,
          subject: parsed.data.subject,
          education: parsed.data.education,
          shortBiography: parsed.data.shortBiography,
          photoUrl,
          sortOrder: parsed.data.sortOrder,
          isPrincipal: parsed.data.isPrincipal,
          isActive: parsed.data.isActive,
        },
        select: teacherSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "TEACHER_CREATED",
          entity: "Teacher",
          entityId: teacher.id,
          newValue: teacher,
        },
      });

      return teacher;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedPhoto);

    revalidateTeacherPaths();

    return {
      status: "success",
      message: parsed.data.isPrincipal
        ? "Data guru berhasil ditambahkan dan ditetapkan sebagai kepala sekolah."
        : "Data guru berhasil ditambahkan.",
      teacherId: createdTeacher.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedPhoto);
    }

    console.error("Gagal menambahkan guru.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingPhotoState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueConstraintState(error);
    }

    return {
      status: "error",
      message: "Data guru gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateTeacherAction(
  _previousState: TeacherActionState,
  formData: FormData,
): Promise<TeacherActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = teacherIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID guru tidak valid.",
    };
  }

  const parsed = teacherFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedPhoto: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    const currentTeacher = await prisma.teacher.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: teacherSelect,
    });

    if (!currentTeacher) {
      return {
        status: "error",
        message: "Data guru tidak ditemukan.",
      };
    }

    preparedPhoto = await preparePendingMediaCommit(
      parsed.data.photoUrl,
      "teachers",
    );

    const photoUrl = preparedPhoto?.finalUrl ?? parsed.data.photoUrl;

    const updatedTeacher = await prisma.$transaction(async (transaction) => {
      if (parsed.data.isPrincipal) {
        await transaction.teacher.updateMany({
          where: {
            isPrincipal: true,
            id: {
              not: currentTeacher.id,
            },
          },
          data: {
            isPrincipal: false,
          },
        });
      }

      const teacher = await transaction.teacher.update({
        where: {
          id: currentTeacher.id,
        },
        data: {
          name: parsed.data.name,
          slug,
          employeeNumber: parsed.data.employeeNumber,
          position: parsed.data.position,
          subject: parsed.data.subject,
          education: parsed.data.education,
          shortBiography: parsed.data.shortBiography,
          photoUrl,
          sortOrder: parsed.data.sortOrder,
          isPrincipal: parsed.data.isPrincipal,
          isActive: parsed.data.isActive,
        },
        select: teacherSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: parsed.data.isPrincipal
            ? "PRINCIPAL_ASSIGNED"
            : "TEACHER_UPDATED",
          entity: "Teacher",
          entityId: currentTeacher.id,
          oldValue: currentTeacher,
          newValue: teacher,
        },
      });

      return teacher;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedPhoto);

    await cleanupTeacherPhoto({
      previousUrl: currentTeacher.photoUrl,
      nextUrl: updatedTeacher.photoUrl,
    });

    revalidateTeacherPaths();

    return {
      status: "success",
      message: parsed.data.isPrincipal
        ? "Data berhasil diperbarui dan guru ditetapkan sebagai satu-satunya kepala sekolah."
        : "Data guru berhasil diperbarui.",
      teacherId: updatedTeacher.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedPhoto);
    }

    console.error("Gagal memperbarui guru.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingPhotoState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueConstraintState(error);
    }

    return {
      status: "error",
      message: "Data guru gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteTeacherAction(
  _previousState: TeacherActionState,
  formData: FormData,
): Promise<TeacherActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = teacherIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID guru tidak valid.",
    };
  }

  try {
    const currentTeacher = await prisma.teacher.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: teacherSelect,
    });

    if (!currentTeacher) {
      return {
        status: "error",
        message: "Data guru tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.teacher.delete({
        where: {
          id: currentTeacher.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "TEACHER_DELETED",
          entity: "Teacher",
          entityId: currentTeacher.id,
          oldValue: currentTeacher,
        },
      });
    });

    await cleanupTeacherPhoto({
      previousUrl: currentTeacher.photoUrl,
    });

    revalidateTeacherPaths();

    return {
      status: "success",
      message: currentTeacher.isPrincipal
        ? "Data kepala sekolah berhasil dihapus. Saat ini belum ada kepala sekolah yang ditetapkan."
        : "Data guru berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus guru.", error);

    return {
      status: "error",
      message: "Data guru gagal dihapus. Silakan coba kembali.",
    };
  }
}
