import { z } from "zod";

export const galleryMediaTypes = ["IMAGE", "VIDEO", "YOUTUBE"] as const;

export type GalleryMediaTypeValue = (typeof galleryMediaTypes)[number];

const galleryMediaTypeSchema = z.enum(galleryMediaTypes);

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

function isYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();

    return [
      "youtube.com",
      "m.youtube.com",
      "youtu.be",
      "youtube-nocookie.com",
    ].includes(hostname);
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

const optionalMediaUrl = z
  .string()
  .trim()
  .max(4_000, "URL maksimal 4.000 karakter.")
  .refine((value) => value === "" || isValidMediaUrl(value), "URL tidak valid.")
  .transform((value) => value || null);

const requiredMediaUrl = z
  .string()
  .trim()
  .min(1, "URL media wajib diisi.")
  .max(4_000, "URL media maksimal 4.000 karakter.")
  .refine(isValidMediaUrl, "URL media tidak valid.");

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Format tanggal kegiatan tidak valid.",
  )
  .transform((value) =>
    value === "" ? null : new Date(`${value}T00:00:00.000Z`),
  )
  .refine(
    (value) => value === null || !Number.isNaN(value.getTime()),
    "Tanggal kegiatan tidak valid.",
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

export const galleryAlbumFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul album wajib diisi.")
    .max(200, "Judul album maksimal 200 karakter."),

  slug: z
    .string()
    .trim()
    .max(220, "Slug maksimal 220 karakter.")
    .optional()
    .default(""),

  description: optionalText(20_000, "Deskripsi maksimal 20.000 karakter."),

  eventDate: optionalDate,

  coverImageUrl: optionalMediaUrl,

  isPublished: booleanFromForm,
});

export const galleryAlbumIdSchema = z.object({
  id: z.string().uuid("ID album galeri tidak valid."),
});

export const galleryMediaFormSchema = z
  .object({
    albumId: z.string().uuid("Album galeri tidak valid."),

    mediaType: galleryMediaTypeSchema,

    fileUrl: requiredMediaUrl,

    thumbnailUrl: optionalMediaUrl,

    caption: optionalText(300, "Keterangan media maksimal 300 karakter."),

    altText: optionalText(220, "Teks alternatif maksimal 220 karakter."),

    sortOrder: z.coerce
      .number()
      .int("Urutan harus berupa bilangan bulat.")
      .min(0, "Urutan minimal 0.")
      .max(9999, "Urutan maksimal 9999."),
  })
  .superRefine((data, context) => {
    if (data.mediaType === "YOUTUBE" && !isYoutubeUrl(data.fileUrl)) {
      context.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "Media YouTube harus menggunakan URL YouTube yang valid.",
      });
    }
  });

export const galleryMediaIdSchema = z.object({
  id: z.string().uuid("ID media galeri tidak valid."),
});
