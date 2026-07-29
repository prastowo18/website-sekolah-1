import { z } from "zod";

function optionalText(
  maximumLength: number,
  message: string,
) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const multilineList = z
  .string()
  .max(
    5_000,
    "Daftar kelompok kelas terlalu panjang.",
  )
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
  .transform(
    (value) => value === "on" || value === "true",
  );

export const extracurricularFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      1,
      "Nama ekstrakurikuler wajib diisi.",
    )
    .max(
      160,
      "Nama ekstrakurikuler maksimal 160 karakter.",
    ),

  slug: z
    .string()
    .trim()
    .max(180, "Slug maksimal 180 karakter.")
    .optional()
    .default(""),

  description: optionalText(
    20_000,
    "Deskripsi maksimal 20.000 karakter.",
  ),

  schedule: optionalText(
    180,
    "Jadwal maksimal 180 karakter.",
  ),

  coach: optionalText(
    160,
    "Nama pembina maksimal 160 karakter.",
  ),

  targetClasses: multilineList,

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),

  isActive: booleanFromForm,
});

export const extracurricularIdSchema = z.object({
  id: z
    .string()
    .uuid("ID ekstrakurikuler tidak valid."),
});
