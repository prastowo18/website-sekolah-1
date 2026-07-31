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

function normalizePlatform(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
}

function normalizeHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export const socialLinkFormSchema = z.object({
  platform: z
    .string()
    .trim()
    .min(1, "Platform wajib diisi.")
    .max(50, "Platform maksimal 50 karakter.")
    .transform(normalizePlatform)
    .refine(
      (value) => /^[A-Z0-9_-]+$/.test(value),
      "Platform hanya boleh berisi huruf, angka, garis bawah, atau tanda hubung.",
    ),

  label: z
    .string()
    .trim()
    .max(80, "Label maksimal 80 karakter.")
    .transform((value) => value || null),

  url: z
    .string()
    .trim()
    .min(1, "URL wajib diisi.")
    .max(4_000, "URL maksimal 4.000 karakter.")
    .refine(
      (value) => normalizeHttpsUrl(value) !== null,
      "Gunakan URL HTTPS yang valid.",
    )
    .transform((value) => normalizeHttpsUrl(value) as string),

  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa bilangan bulat.")
    .min(0, "Urutan minimal 0.")
    .max(9_999, "Urutan maksimal 9999."),

  isActive: booleanFromForm,
});

export const socialLinkIdSchema = z.object({
  id: z.string().uuid("ID media sosial tidak valid."),
});
