import { z } from "zod";

export const postCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(
      120,
      "Nama kategori maksimal 120 karakter.",
    ),

  slug: z
    .string()
    .trim()
    .max(140, "Slug maksimal 140 karakter.")
    .optional()
    .default(""),

  description: z
    .string()
    .trim()
    .max(
      10_000,
      "Deskripsi maksimal 10.000 karakter.",
    )
    .transform((value) => value || null),
});

export const postCategoryIdSchema = z.object({
  id: z
    .string()
    .uuid("ID kategori berita tidak valid."),
});
