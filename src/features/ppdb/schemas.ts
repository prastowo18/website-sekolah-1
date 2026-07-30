import { z } from "zod";

import { normalizePpdbGoogleDriveUrl } from "./google-drive-url";

import { ppdbFeeTypes, ppdbStatuses } from "./constants";

function isValidUrl(value: string, allowRelative = true): boolean {
  if (!value) {
    return true;
  }

  if (allowRelative && value.startsWith("/")) {
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

const optionalUrl = z
  .string()
  .trim()
  .max(4_000, "URL maksimal 4.000 karakter.")
  .refine((value) => isValidUrl(value), "URL tidak valid.")
  .transform((value) => value || null);

const optionalExternalUrl = z
  .string()
  .trim()
  .max(4_000, "URL pendaftaran maksimal 4.000 karakter.")
  .refine(
    (value) => isValidUrl(value, false),
    "URL pendaftaran eksternal tidak valid.",
  )
  .transform((value) => value || null);

const optionalEmail = z
  .string()
  .trim()
  .max(180, "Email maksimal 180 karakter.")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Format email tidak valid.",
  )
  .transform((value) => value || null);

const optionalPhone = z
  .string()
  .trim()
  .max(30, "Nomor telepon maksimal 30 karakter.")
  .refine(
    (value) => value === "" || /^[0-9+().\-\s]{6,30}$/.test(value),
    "Format nomor telepon tidak valid.",
  )
  .transform((value) => value || null);

const optionalIsoDateTime = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) {
      return true;
    }

    const includesTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

    return includesTimeZone && !Number.isNaN(Date.parse(value));
  }, "Tanggal dan waktu harus memiliki zona waktu.")
  .transform((value) => (value ? new Date(value) : null));

const booleanFromForm = z
  .union([
    z.literal("on"),
    z.literal("true"),
    z.literal("false"),
    z.literal(""),
  ])
  .optional()
  .transform((value) => value === "on" || value === "true");

const optionalInteger = (maximum: number, label: string) =>
  z.preprocess(
    (value) => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "")
      ) {
        return null;
      }

      return value;
    },
    z.coerce
      .number()
      .int(`${label} harus berupa bilangan bulat.`)
      .min(0, `${label} minimal 0.`)
      .max(maximum, `${label} maksimal ${maximum}.`)
      .nullable(),
  );

const sortOrderSchema = z.coerce
  .number()
  .int("Urutan harus berupa bilangan bulat.")
  .min(0, "Urutan minimal 0.")
  .max(9999, "Urutan maksimal 9999.");

const optionalAmount = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{1,12}(?:\.\d{1,2})?$/.test(value),
    "Nominal harus berupa angka positif dengan maksimal dua angka desimal.",
  )
  .transform((value) => value || null);

export const ppdbInformationFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul PPDB wajib diisi.")
      .max(220, "Judul PPDB maksimal 220 karakter."),

    academicYear: z
      .string()
      .trim()
      .min(4, "Tahun ajaran wajib diisi.")
      .max(20, "Tahun ajaran maksimal 20 karakter."),

    status: z.enum(ppdbStatuses),

    shortDescription: optionalText(
      360,
      "Deskripsi singkat maksimal 360 karakter.",
    ),

    description: optionalText(50_000, "Deskripsi maksimal 50.000 karakter."),

    quota: optionalInteger(100_000, "Kuota"),

    brochureUrl: optionalUrl

      .refine(
        (value) =>
          value === null || normalizePpdbGoogleDriveUrl(value) !== null,

        "Gunakan URL HTTPS dari drive.google.com atau docs.google.com.",
      )

      .transform((value) =>
        value ? normalizePpdbGoogleDriveUrl(value) : null,
      ),

    externalRegistrationUrl: optionalExternalUrl,

    registrationLocation: optionalText(
      10_000,
      "Lokasi pendaftaran maksimal 10.000 karakter.",
    ),

    contactPerson: optionalText(160, "Nama kontak maksimal 160 karakter."),

    contactPhone: optionalPhone,

    contactEmail: optionalEmail,

    serviceHours: optionalText(180, "Jam pelayanan maksimal 180 karakter."),

    scholarshipInformation: optionalText(
      20_000,
      "Informasi beasiswa maksimal 20.000 karakter.",
    ),

    showFee: booleanFromForm,

    showExternalRegistrationButton: booleanFromForm,

    isActive: booleanFromForm,
  })
  .superRefine((data, context) => {
    if (data.showExternalRegistrationButton && !data.externalRegistrationUrl) {
      context.addIssue({
        code: "custom",
        path: ["externalRegistrationUrl"],
        message:
          "URL pendaftaran eksternal wajib diisi ketika tombol pendaftaran ditampilkan.",
      });
    }
  });

export const ppdbInformationIdSchema = z.object({
  id: z.string().uuid("ID informasi PPDB tidak valid."),
});

export const ppdbTimelineFormSchema = z
  .object({
    ppdbId: z.string().uuid("Informasi PPDB tidak valid."),

    title: z
      .string()
      .trim()
      .min(1, "Judul jadwal wajib diisi.")
      .max(160, "Judul jadwal maksimal 160 karakter."),

    description: optionalText(
      20_000,
      "Deskripsi jadwal maksimal 20.000 karakter.",
    ),

    startDate: optionalIsoDateTime,

    endDate: optionalIsoDateTime,

    sortOrder: sortOrderSchema,
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

export const ppdbTimelineIdSchema = z.object({
  id: z.string().uuid("ID jadwal PPDB tidak valid."),
});

export const ppdbRequirementFormSchema = z.object({
  ppdbId: z.string().uuid("Informasi PPDB tidak valid."),

  title: z
    .string()
    .trim()
    .min(1, "Judul persyaratan wajib diisi.")
    .max(180, "Judul persyaratan maksimal 180 karakter."),

  description: optionalText(
    20_000,
    "Deskripsi persyaratan maksimal 20.000 karakter.",
  ),

  isRequired: booleanFromForm,

  sortOrder: sortOrderSchema,
});

export const ppdbRequirementIdSchema = z.object({
  id: z.string().uuid("ID persyaratan PPDB tidak valid."),
});

export const ppdbFlowStepFormSchema = z.object({
  ppdbId: z.string().uuid("Informasi PPDB tidak valid."),

  title: z
    .string()
    .trim()
    .min(1, "Judul alur wajib diisi.")
    .max(180, "Judul alur maksimal 180 karakter."),

  description: optionalText(20_000, "Deskripsi alur maksimal 20.000 karakter."),

  sortOrder: z.coerce
    .number()
    .int("Nomor langkah harus berupa bilangan bulat.")
    .min(1, "Nomor langkah minimal 1.")
    .max(9999, "Nomor langkah maksimal 9999."),
});

export const ppdbFlowStepIdSchema = z.object({
  id: z.string().uuid("ID alur PPDB tidak valid."),
});

export const ppdbFeeFormSchema = z.object({
  ppdbId: z.string().uuid("Informasi PPDB tidak valid."),

  name: z
    .string()
    .trim()
    .min(1, "Nama biaya wajib diisi.")
    .max(180, "Nama biaya maksimal 180 karakter."),

  feeType: z.enum(ppdbFeeTypes),

  amount: optionalAmount,

  description: optionalText(
    20_000,
    "Deskripsi biaya maksimal 20.000 karakter.",
  ),

  isOptional: booleanFromForm,

  sortOrder: sortOrderSchema,
});

export const ppdbFeeIdSchema = z.object({
  id: z.string().uuid("ID biaya PPDB tidak valid."),
});
