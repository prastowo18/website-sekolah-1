'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  createSession,
  deleteCurrentSession,
  getCurrentSession,
} from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

import { changePasswordSchema } from './change-password-schema';
import type { ChangePasswordActionState } from './change-password-types';

export async function changePasswordAction(
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;

    return {
      status: 'error',
      message: 'Periksa kembali data password.',
      fieldErrors: {
        currentPassword: errors.currentPassword,
        newPassword: errors.newPassword,
        confirmPassword: errors.confirmPassword,
      },
    };
  }

  const session = await getCurrentSession();

  if (!session) {
    redirect('/admin/login');
  }

  let user;

  try {
    user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });
  } catch (error: unknown) {
    console.error('Gagal membaca akun pengguna.', error);

    return {
      status: 'error',
      message: 'Terjadi gangguan pada server. Silakan coba kembali.',
    };
  }

  if (!user || !user.isActive) {
    await deleteCurrentSession();
    redirect('/admin/login');
  }

  const { currentPassword, newPassword } = parsed.data;

  const currentPasswordIsValid = await verifyPassword(
    currentPassword,
    user.passwordHash,
  );

  if (!currentPasswordIsValid) {
    return {
      status: 'error',
      message: 'Password saat ini tidak sesuai.',
      fieldErrors: {
        currentPassword: ['Masukkan password saat ini dengan benar.'],
      },
    };
  }

  try {
    const passwordHash = await hashPassword(newPassword);

    const changedAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
          mustChangePassword: false,
          passwordChangedAt: changedAt,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),

      prisma.userSession.deleteMany({
        where: {
          userId: user.id,
        },
      }),

      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: user.id,
          newValue: {
            passwordChanged: true,
            changedAt: changedAt.toISOString(),
          },
        },
      }),
    ]);

    await createSession(user.id);
  } catch (error: unknown) {
    console.error('Gagal mengubah password.', error);

    return {
      status: 'error',
      message: 'Password gagal diubah. Silakan coba kembali.',
    };
  }

  redirect('/admin/dashboard');
}
