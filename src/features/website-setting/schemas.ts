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

function isPlainText(value: string): boolean {
  return !/[<>]/.test(value);
}

function optionalPlainText(maximumLength: number, maximumMessage: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, maximumMessage)
    .refine(isPlainText, "HTML dan tanda < atau > tidak diperbolehkan.");
}

function isValidPublicImageUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export const websiteSettingSchema = z.object({
  defaultTitle: optionalPlainText(180, "Judul SEO maksimal 180 karakter."),

  defaultDescription: optionalPlainText(
    320,
    "Deskripsi SEO maksimal 320 karakter.",
  ),

  keywords: optionalPlainText(1_000, "Kata kunci maksimal 1.000 karakter."),

  openGraphImageUrl: z
    .string()
    .trim()
    .max(4_000, "URL gambar Open Graph maksimal 4.000 karakter.")
    .refine(
      isValidPublicImageUrl,
      "Gunakan URL HTTPS atau path gambar lokal yang valid.",
    ),

  allowIndexing: booleanFromForm,

  googleSiteVerification: z
    .string()
    .trim()
    .max(200, "Kode verifikasi Google maksimal 200 karakter.")
    .refine(
      (value) => value === "" || /^[A-Za-z0-9_-]+$/.test(value),
      "Kode verifikasi Google tidak valid.",
    ),

  twitterHandle: z
    .string()
    .trim()
    .max(16, "Username X/Twitter maksimal 15 karakter.")
    .refine(
      (value) => value === "" || /^@?[A-Za-z0-9_]{1,15}$/.test(value),
      "Username X/Twitter tidak valid.",
    )
    .transform((value) => {
      if (!value) {
        return "";
      }

      return value.startsWith("@") ? value : `@${value}`;
    }),
});

export type WebsiteSettingInput = z.infer<typeof websiteSettingSchema>;
