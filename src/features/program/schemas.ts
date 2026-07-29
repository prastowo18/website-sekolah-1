import { z } from "zod";

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const multilineList = z
  .string()
  .max(10_000, "Daftar manfaat terlalu panjang.")
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const programFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama program wajib diisi.")
    .max(160, "Nama program maksimal 160 karakter."),

  slug: z
    .string()
    .trim()
    .max(180, "Slug maksimal 180 karakter.")
    .optional()
    .default(""),

  shortDescription: optionalText(
    300,
    "Deskripsi singkat maksimal 300 karakter.",
  ),

  description: optionalText(20_000, "Deskripsi maksimal 20.000 karakter."),

  benefits: multilineList,

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),

  isFeatured: booleanFromForm,
  isActive: booleanFromForm,
});

export const programIdSchema = z.object({
  id: z.string().uuid("ID program tidak valid."),
});

export type ProgramFormInput = z.infer<typeof programFormSchema>;
