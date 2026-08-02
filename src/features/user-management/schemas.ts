import { z } from "zod";

const roleSchema = z.enum(["SUPER_ADMIN", "CONTENT_ADMIN", "VIEWER"]);

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter.")
  .max(50, "Username maksimal 50 karakter.")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Username hanya boleh memuat huruf, angka, titik, garis bawah, dan tanda hubung.",
  )
  .transform((value) => value.toLowerCase());

const optionalEmailSchema = z
  .string()
  .trim()
  .max(180, "Email maksimal 180 karakter.")
  .refine(
    (value) =>
      value.length === 0 || z.string().email().safeParse(value).success,
    "Format email tidak valid.",
  )
  .transform((value) => (value ? value.toLowerCase() : null));

const passwordSchema = z
  .string()
  .min(12, "Password minimal 12 karakter.")
  .max(128, "Password maksimal 128 karakter.");

export const createUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(120, "Nama maksimal 120 karakter."),
    username: usernameSchema,
    email: optionalEmailSchema,
    role: roleSchema,
    temporaryPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (value.temporaryPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama.",
      });
    }
  });

export const updateUserSchema = z.object({
  userId: z.string().uuid("ID pengguna tidak valid."),
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(120, "Nama maksimal 120 karakter."),
  username: usernameSchema,
  email: optionalEmailSchema,
  role: roleSchema,
});

export const changeUserStatusSchema = z.object({
  userId: z.string().uuid("ID pengguna tidak valid."),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const resetUserPasswordSchema = z
  .object({
    userId: z.string().uuid("ID pengguna tidak valid."),
    temporaryPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((value, context) => {
    if (value.temporaryPassword !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama.",
      });
    }
  });

export const userIdSchema = z.object({
  userId: z.string().uuid("ID pengguna tidak valid."),
});
