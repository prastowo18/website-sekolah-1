import { z } from "zod";

import { isGoogleDriveUrl, normalizeGoogleDriveUrl } from "./google-drive-url";

const optionalText = (maximumLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);

const googleDriveUrl = z
  .string()
  .trim()
  .min(1, "URL Google Drive wajib diisi.")
  .max(4_000, "URL Google Drive maksimal 4.000 karakter.")
  .refine(
    isGoogleDriveUrl,
    "Gunakan URL HTTPS dari drive.google.com atau docs.google.com.",
  )
  .transform((value) => normalizeGoogleDriveUrl(value) ?? value);

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const downloadDocumentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama dokumen wajib diisi.")
    .max(200, "Nama dokumen maksimal 200 karakter."),

  slug: z
    .string()
    .trim()
    .max(220, "Slug maksimal 220 karakter.")
    .optional()
    .default(""),

  description: optionalText(20_000, "Deskripsi maksimal 20.000 karakter."),

  category: optionalText(100, "Kategori maksimal 100 karakter."),

  fileUrl: googleDriveUrl,

  fileName: z
    .string()
    .trim()
    .min(1, "Nama file wajib diisi.")
    .max(255, "Nama file maksimal 255 karakter.")
    .refine(
      (value) => !/[\\/]/.test(value),
      "Nama file tidak boleh mengandung path.",
    )
    .refine(
      (value) => !/[\u0000-\u001f]/.test(value),
      "Nama file mengandung karakter yang tidak valid.",
    ),

  fileType: optionalText(80, "Tipe file maksimal 80 karakter."),

  isActive: booleanFromForm,
});

export const downloadDocumentIdSchema = z.object({
  id: z.string().uuid("ID dokumen tidak valid."),
});

export type DownloadDocumentFormInput = z.infer<
  typeof downloadDocumentFormSchema
>;
