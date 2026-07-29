import { z } from "zod";

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Pertanyaan wajib diisi.")
    .max(300, "Pertanyaan maksimal 300 karakter."),

  answer: z
    .string()
    .trim()
    .min(1, "Jawaban wajib diisi.")
    .max(100_000, "Jawaban maksimal 100.000 karakter."),

  category: z
    .string()
    .trim()
    .max(100, "Kategori maksimal 100 karakter.")
    .transform((value) => value || null),

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),

  isActive: booleanFromForm,
});

export const faqIdSchema = z.object({
  id: z.string().uuid("ID FAQ tidak valid."),
});
