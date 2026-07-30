import { z } from "zod";

import {
  isAnnouncementGoogleDriveUrl,
  normalizeAnnouncementGoogleDriveUrl,
} from "./google-drive-url";

export const announcementPriorities = [
  "NORMAL",
  "IMPORTANT",
  "URGENT",
] as const;

export type AnnouncementPriorityValue = (typeof announcementPriorities)[number];

const announcementPrioritySchema = z.enum(announcementPriorities);

const optionalGoogleDriveUrl = z
  .string()
  .trim()
  .max(4_000, "URL lampiran maksimal 4.000 karakter.")
  .refine(
    (value) => value === "" || isAnnouncementGoogleDriveUrl(value),
    "Gunakan URL HTTPS dari drive.google.com atau docs.google.com.",
  )
  .transform((value) => {
    if (!value) {
      return null;
    }

    return normalizeAnnouncementGoogleDriveUrl(value);
  });

const optionalIsoDateTime = z
  .string()
  .trim()
  .refine((value) => {
    if (value === "") {
      return true;
    }

    const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

    return hasTimeZone && !Number.isNaN(Date.parse(value));
  }, "Tanggal dan waktu harus dilengkapi zona waktu.")
  .transform((value) => (value === "" ? null : new Date(value)));

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

export const announcementFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul pengumuman wajib diisi.")
      .max(220, "Judul pengumuman maksimal 220 karakter."),

    slug: z
      .string()
      .trim()
      .max(240, "Slug maksimal 240 karakter.")
      .optional()
      .default(""),

    content: z
      .string()
      .trim()
      .min(1, "Isi pengumuman wajib diisi.")
      .max(100_000, "Isi pengumuman maksimal 100.000 karakter."),

    priority: announcementPrioritySchema,

    attachmentUrl: optionalGoogleDriveUrl,

    startDate: optionalIsoDateTime,

    endDate: optionalIsoDateTime,

    isPinned: booleanFromForm,

    isActive: booleanFromForm,
  })
  .superRefine((data, context) => {
    if (
      data.startDate &&
      data.endDate &&
      data.endDate.getTime() <= data.startDate.getTime()
    ) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Waktu selesai harus setelah waktu mulai.",
      });
    }
  });

export const announcementIdSchema = z.object({
  id: z.string().uuid("ID pengumuman tidak valid."),
});

export type AnnouncementFormInput = z.infer<typeof announcementFormSchema>;
