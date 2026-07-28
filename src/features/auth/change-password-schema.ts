import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Password saat ini wajib diisi.')
      .max(128, 'Password saat ini terlalu panjang.'),

    newPassword: z
      .string()
      .min(12, 'Password baru minimal 12 karakter.')
      .max(128, 'Password baru maksimal 128 karakter.'),

    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi.')
      .max(128, 'Konfirmasi password terlalu panjang.'),
  })
  .superRefine((data, context) => {
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Konfirmasi password tidak sama.',
      });
    }

    if (data.currentPassword === data.newPassword) {
      context.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Password baru harus berbeda dari password saat ini.',
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
