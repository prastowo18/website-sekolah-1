'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { UserRole } from '@/generated/prisma/client';
import { requireAdminRole } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { schoolProfileSchema } from './schemas';
import type { SchoolProfileActionState, SchoolProfileFieldName } from './types';

const profileSelect = {
  schoolName: true,
  shortName: true,
  npsn: true,
  tagline: true,
  shortDescription: true,
  history: true,
  vision: true,
  mission: true,
  goals: true,
  schoolValues: true,
  accreditation: true,
  foundedYear: true,
  principalName: true,
  principalTitle: true,
  principalGreeting: true,
  address: true,
  village: true,
  district: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  whatsapp: true,
  email: true,
  operationalHours: true,
} as const;

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export async function updateSchoolProfileAction(
  _previousState: SchoolProfileActionState,
  formData: FormData,
): Promise<SchoolProfileActionState> {
  const session = await requireAdminRole([
    UserRole.SUPER_ADMIN,
    UserRole.CONTENT_ADMIN,
  ]);

  const parsed = schoolProfileSchema.safeParse({
    schoolName: formData.get('schoolName'),
    shortName: formData.get('shortName'),
    npsn: formData.get('npsn'),
    tagline: formData.get('tagline'),
    shortDescription: formData.get('shortDescription'),
    history: formData.get('history'),
    vision: formData.get('vision'),
    mission: formData.get('mission'),
    goals: formData.get('goals'),
    schoolValues: formData.get('schoolValues'),
    accreditation: formData.get('accreditation'),
    foundedYear: formData.get('foundedYear'),
    principalName: formData.get('principalName'),
    principalTitle: formData.get('principalTitle'),
    principalGreeting: formData.get('principalGreeting'),
    address: formData.get('address'),
    village: formData.get('village'),
    district: formData.get('district'),
    city: formData.get('city'),
    province: formData.get('province'),
    postalCode: formData.get('postalCode'),
    phone: formData.get('phone'),
    whatsapp: formData.get('whatsapp'),
    email: formData.get('email'),
    operationalHours: formData.get('operationalHours'),
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;

    return {
      status: 'error',
      message: 'Periksa kembali data profil sekolah.',
      fieldErrors: errors as Partial<Record<SchoolProfileFieldName, string[]>>,
    };
  }

  try {
    const currentProfile = await prisma.schoolProfile.findUnique({
      where: {
        id: 'school',
      },
      select: profileSelect,
    });

    await prisma.$transaction(async (transaction) => {
      const updatedProfile = await transaction.schoolProfile.upsert({
        where: {
          id: 'school',
        },
        create: {
          id: 'school',
          ...parsed.data,
        },
        update: parsed.data,
        select: profileSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: 'SCHOOL_PROFILE_UPDATED',
          entity: 'SchoolProfile',
          entityId: 'school',
          oldValue: currentProfile ?? undefined,
          newValue: updatedProfile,
        },
      });
    });
  } catch (error: unknown) {
    console.error('Gagal memperbarui profil sekolah.', error);

    if (isPrismaUniqueError(error)) {
      return {
        status: 'error',
        message: 'NPSN sudah digunakan pada data lain.',
        fieldErrors: {
          npsn: ['Gunakan NPSN yang belum terdaftar.'],
        },
      };
    }

    return {
      status: 'error',
      message: 'Profil sekolah gagal disimpan. Silakan coba kembali.',
    };
  }

  revalidatePath('/');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/profil-sekolah');

  return {
    status: 'success',
    message: 'Profil sekolah berhasil diperbarui.',
  };
}
