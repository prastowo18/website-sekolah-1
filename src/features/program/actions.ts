'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { UserRole } from '@/generated/prisma/client';
import { requireAdminRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { programFormSchema, programIdSchema } from './schemas';
import type { ProgramActionState, ProgramFieldName } from './types';
import { createSlug } from './utils';

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const programSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  benefits: true,
  isFeatured: true,
  isActive: true,
  sortOrder: true,
  publishedAt: true,
} as const;

type ProgramAuditValue = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  publishedAt: string | null;
};

function toAuditValue(program: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  benefits: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  publishedAt: Date | null;
}): ProgramAuditValue {
  return {
    ...program,
    publishedAt: program.publishedAt?.toISOString() ?? null,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

function getFormValues(formData: FormData) {
  return {
    name: formData.get('name'),
    slug: formData.get('slug') ?? '',
    shortDescription: formData.get('shortDescription'),
    description: formData.get('description'),
    benefits: formData.get('benefits') ?? '',
    sortOrder: formData.get('sortOrder') ?? '0',
    isFeatured: formData.get('isFeatured') ?? '',
    isActive: formData.get('isActive') ?? '',
  };
}

function validationErrorState(error: z.ZodError): ProgramActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: 'error',
    message: 'Periksa kembali data program.',
    fieldErrors: errors as Partial<Record<ProgramFieldName, string[]>>,
  };
}

function revalidateProgramPaths(): void {
  revalidatePath('/');
  revalidatePath('/program');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/program');
}

export async function createProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = programFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return {
      status: 'error',
      message: 'Slug program tidak valid.',
      fieldErrors: {
        slug: ['Gunakan nama atau slug yang mengandung huruf atau angka.'],
      },
    };
  }

  try {
    const createdProgram = await prisma.$transaction(async (transaction) => {
      const program = await transaction.program.create({
        data: {
          name: parsed.data.name,
          slug,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          benefits: parsed.data.benefits,
          sortOrder: parsed.data.sortOrder,
          isFeatured: parsed.data.isFeatured,
          isActive: parsed.data.isActive,
          publishedAt: parsed.data.isActive ? new Date() : null,
        },
        select: programSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'PROGRAM_CREATED',
          entity: 'Program',
          entityId: program.id,
          newValue: toAuditValue(program),
        },
      });

      return program;
    });

    revalidateProgramPaths();

    return {
      status: 'success',
      message: 'Program berhasil ditambahkan.',
      programId: createdProgram.id,
    };
  } catch (error: unknown) {
    console.error('Gagal menambahkan program.', error);

    if (isUniqueConstraintError(error)) {
      return {
        status: 'error',
        message: 'Slug sudah digunakan oleh program lain.',
        fieldErrors: {
          slug: ['Gunakan slug yang berbeda.'],
        },
      };
    }

    return {
      status: 'error',
      message: 'Program gagal ditambahkan. Silakan coba kembali.',
    };
  }
}

export async function updateProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = programIdSchema.safeParse({
    id: formData.get('id'),
  });

  if (!idParsed.success) {
    return {
      status: 'error',
      message: 'ID program tidak valid.',
    };
  }

  const parsed = programFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return {
      status: 'error',
      message: 'Slug program tidak valid.',
      fieldErrors: {
        slug: ['Gunakan nama atau slug yang mengandung huruf atau angka.'],
      },
    };
  }

  try {
    const currentProgram = await prisma.program.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: programSelect,
    });

    if (!currentProgram) {
      return {
        status: 'error',
        message: 'Program tidak ditemukan.',
      };
    }

    await prisma.$transaction(async (transaction) => {
      const updatedProgram = await transaction.program.update({
        where: {
          id: currentProgram.id,
        },
        data: {
          name: parsed.data.name,
          slug,
          shortDescription: parsed.data.shortDescription,
          description: parsed.data.description,
          benefits: parsed.data.benefits,
          sortOrder: parsed.data.sortOrder,
          isFeatured: parsed.data.isFeatured,
          isActive: parsed.data.isActive,
          publishedAt:
            parsed.data.isActive && !currentProgram.publishedAt
              ? new Date()
              : currentProgram.publishedAt,
        },
        select: programSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'PROGRAM_UPDATED',
          entity: 'Program',
          entityId: currentProgram.id,
          oldValue: toAuditValue(currentProgram),
          newValue: toAuditValue(updatedProgram),
        },
      });
    });

    revalidateProgramPaths();

    return {
      status: 'success',
      message: 'Program berhasil diperbarui.',
      programId: currentProgram.id,
    };
  } catch (error: unknown) {
    console.error('Gagal memperbarui program.', error);

    if (isUniqueConstraintError(error)) {
      return {
        status: 'error',
        message: 'Slug sudah digunakan oleh program lain.',
        fieldErrors: {
          slug: ['Gunakan slug yang berbeda.'],
        },
      };
    }

    return {
      status: 'error',
      message: 'Program gagal diperbarui. Silakan coba kembali.',
    };
  }
}

export async function deleteProgramAction(
  _previousState: ProgramActionState,
  formData: FormData,
): Promise<ProgramActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = programIdSchema.safeParse({
    id: formData.get('id'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'ID program tidak valid.',
    };
  }

  try {
    const currentProgram = await prisma.program.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: programSelect,
    });

    if (!currentProgram) {
      return {
        status: 'error',
        message: 'Program tidak ditemukan.',
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.program.delete({
        where: {
          id: currentProgram.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'PROGRAM_DELETED',
          entity: 'Program',
          entityId: currentProgram.id,
          oldValue: toAuditValue(currentProgram),
        },
      });
    });

    revalidateProgramPaths();

    return {
      status: 'success',
      message: 'Program berhasil dihapus.',
    };
  } catch (error: unknown) {
    console.error('Gagal menghapus program.', error);

    return {
      status: 'error',
      message: 'Program gagal dihapus. Silakan coba kembali.',
    };
  }
}
