import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Username atau email wajib diisi.")
    .max(180, "Username atau email terlalu panjang.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .max(128, "Password terlalu panjang."),
});

export type LoginInput = z.infer<typeof loginSchema>;
