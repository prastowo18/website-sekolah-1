import { z } from "zod";

function isValidMediaUrl(value: string): boolean {
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

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const optionalPhotoUrl = z
  .string()
  .trim()
  .max(4_000, "URL foto maksimal 4.000 karakter.")
  .refine(
    (value) => value === "" || isValidMediaUrl(value),
    "URL foto tidak valid.",
  )
  .transform((value) => value || null);

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const teacherFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama guru wajib diisi.")
    .max(160, "Nama guru maksimal 160 karakter."),

  slug: z
    .string()
    .trim()
    .max(180, "Slug maksimal 180 karakter.")
    .optional()
    .default(""),

  employeeNumber: optionalText(50, "Nomor pegawai maksimal 50 karakter."),

  position: optionalText(120, "Jabatan maksimal 120 karakter."),

  subject: optionalText(120, "Mata pelajaran maksimal 120 karakter."),

  education: optionalText(180, "Pendidikan maksimal 180 karakter."),

  shortBiography: optionalText(
    20_000,
    "Biografi singkat maksimal 20.000 karakter.",
  ),

  photoUrl: optionalPhotoUrl,

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),

  isPrincipal: booleanFromForm,
  isActive: booleanFromForm,
});

export const teacherIdSchema = z.object({
  id: z.string().uuid("ID guru tidak valid."),
});

export type TeacherFormInput = z.infer<typeof teacherFormSchema>;
