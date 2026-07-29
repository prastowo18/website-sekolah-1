import { z } from "zod";

const achievementTypeSchema = z.enum(["STUDENT", "TEACHER", "SCHOOL"]);

const competitionLevelSchema = z.enum([
  "SCHOOL",
  "DISTRICT",
  "CITY",
  "PROVINCE",
  "NATIONAL",
  "INTERNATIONAL",
]);

function optionalText(maximumLength: number, message: string) {
  return z
    .string()
    .trim()
    .max(maximumLength, message)
    .transform((value) => value || null);
}

const optionalCompetitionLevel = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || competitionLevelSchema.safeParse(value).success,
    "Tingkat kompetisi tidak valid.",
  )
  .transform((value) =>
    value === "" ? null : competitionLevelSchema.parse(value),
  );

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Format tanggal prestasi tidak valid.",
  )
  .transform((value) =>
    value === "" ? null : new Date(`${value}T00:00:00.000Z`),
  )
  .refine(
    (value) => value === null || !Number.isNaN(value.getTime()),
    "Tanggal prestasi tidak valid.",
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

export const achievementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul prestasi wajib diisi.")
    .max(220, "Judul prestasi maksimal 220 karakter."),

  slug: z
    .string()
    .trim()
    .max(240, "Slug maksimal 240 karakter.")
    .optional()
    .default(""),

  achievementType: achievementTypeSchema,

  category: optionalText(120, "Kategori maksimal 120 karakter."),

  winnerName: optionalText(
    180,
    "Nama penerima prestasi maksimal 180 karakter.",
  ),

  competitionLevel: optionalCompetitionLevel,

  rank: optionalText(80, "Peringkat maksimal 80 karakter."),

  achievementDate: optionalDate,

  description: optionalText(20_000, "Deskripsi maksimal 20.000 karakter."),

  isPublished: booleanFromForm,
});

export const achievementIdSchema = z.object({
  id: z.string().uuid("ID prestasi tidak valid."),
});
