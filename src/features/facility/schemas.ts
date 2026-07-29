import { z } from "zod";

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const facilityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama fasilitas wajib diisi.")
    .max(160, "Nama fasilitas maksimal 160 karakter."),

  slug: z
    .string()
    .trim()
    .max(180, "Slug maksimal 180 karakter.")
    .optional()
    .default(""),

  description: optionalText(20_000, "Deskripsi maksimal 20.000 karakter."),

  capacity: optionalText(120, "Kapasitas maksimal 120 karakter."),

  condition: optionalText(120, "Kondisi fasilitas maksimal 120 karakter."),

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9999, "Urutan maksimal 9999."),

  isActive: booleanFromForm,
});

export const facilityIdSchema = z.object({
  id: z.string().uuid("ID fasilitas tidak valid."),
});

export type FacilityFormInput = z.infer<typeof facilityFormSchema>;
