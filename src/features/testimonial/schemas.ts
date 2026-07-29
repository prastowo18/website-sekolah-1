import { z } from "zod";

function isValidMediaUrl(value: string): boolean {
  if (!value) {
    return true;
  }

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

const optionalPhotoUrl = z
  .string()
  .trim()
  .max(4_000, "URL foto maksimal 4.000 karakter.")
  .refine(isValidMediaUrl, "URL foto tidak valid.")
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

export const testimonialFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama pemberi testimoni wajib diisi.")
    .max(160, "Nama maksimal 160 karakter."),

  role: optionalText(120, "Peran maksimal 120 karakter."),

  content: z
    .string()
    .trim()
    .min(1, "Isi testimoni wajib diisi.")
    .max(10_000, "Isi testimoni maksimal 10.000 karakter."),

  photoUrl: optionalPhotoUrl,

  isPublished: booleanFromForm,

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),
});

export const testimonialIdSchema = z.object({
  id: z.string().uuid("ID testimoni tidak valid."),
});

export type TestimonialFormInput = z.infer<typeof testimonialFormSchema>;
