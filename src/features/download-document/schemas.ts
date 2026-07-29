import { z } from "zod";

const MAX_INT_VALUE = 2_147_483_647;

function isValidFileUrl(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalText = (maximumLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);

const optionalFileSize = z.preprocess((value) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  return value;
}, z.coerce.number().int("Ukuran file harus berupa bilangan bulat.").min(0, "Ukuran file tidak boleh bernilai negatif.").max(MAX_INT_VALUE, "Ukuran file melebihi batas yang didukung.").nullable());

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

  fileUrl: z
    .string()
    .trim()
    .min(1, "URL file wajib diisi.")
    .max(4_000, "URL file maksimal 4.000 karakter.")
    .refine(isValidFileUrl, "URL file tidak valid."),

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

  fileSizeBytes: optionalFileSize,

  fileType: optionalText(80, "Tipe file maksimal 80 karakter."),

  isActive: booleanFromForm,
});

export const downloadDocumentIdSchema = z.object({
  id: z.string().uuid("ID dokumen tidak valid."),
});

export type DownloadDocumentFormInput = z.infer<
  typeof downloadDocumentFormSchema
>;
