import { z } from "zod";

export const postStatuses = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type PostStatusValue = (typeof postStatuses)[number];

const postStatusSchema = z.enum(postStatuses);

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

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

const optionalMediaUrl = z
  .string()
  .trim()
  .max(4_000, "URL gambar maksimal 4.000 karakter.")
  .refine(isValidMediaUrl, "URL gambar utama tidak valid.")
  .transform((value) => value || null);

const optionalCategoryId = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().uuid().safeParse(value).success,
    "Kategori berita tidak valid.",
  )
  .transform((value) => value || null);

const optionalIsoDateTime = z
  .string()
  .trim()
  .refine((value) => {
    if (value === "") {
      return true;
    }

    const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

    return hasTimeZone && !Number.isNaN(Date.parse(value));
  }, "Jadwal harus berupa tanggal dan waktu lengkap dengan zona waktu.")
  .transform((value) => (value === "" ? null : new Date(value)));

export const postFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul berita wajib diisi.")
      .max(240, "Judul berita maksimal 240 karakter."),

    slug: z
      .string()
      .trim()
      .max(260, "Slug maksimal 260 karakter.")
      .optional()
      .default(""),

    excerpt: optionalText(360, "Ringkasan maksimal 360 karakter."),

    content: z
      .string()
      .trim()
      .min(1, "Isi berita wajib diisi.")
      .max(100_000, "Isi berita maksimal 100.000 karakter."),

    featuredImageUrl: optionalMediaUrl,

    status: postStatusSchema,

    scheduledAt: optionalIsoDateTime,

    categoryId: optionalCategoryId,

    seoTitle: optionalText(180, "Judul SEO maksimal 180 karakter."),

    seoDescription: optionalText(320, "Deskripsi SEO maksimal 320 karakter."),
  })
  .superRefine((data, context) => {
    if (data.status === "SCHEDULED" && !data.scheduledAt) {
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Jadwal publikasi wajib diisi untuk berita terjadwal.",
      });

      return;
    }

    if (
      data.status === "SCHEDULED" &&
      data.scheduledAt &&
      data.scheduledAt.getTime() <= Date.now()
    ) {
      context.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Jadwal publikasi harus berada di masa mendatang.",
      });
    }
  });

export const postIdSchema = z.object({
  id: z.string().uuid("ID berita tidak valid."),
});

export type PostFormInput = z.infer<typeof postFormSchema>;
