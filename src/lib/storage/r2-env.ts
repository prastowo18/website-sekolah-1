import "server-only";

import { z } from "zod";

const r2EnvironmentSchema = z.object({
  R2_ENDPOINT: z
    .string()
    .trim()
    .url("R2_ENDPOINT tidak valid.")
    .refine(
      (value) => value.startsWith("https://"),
      "R2_ENDPOINT wajib menggunakan HTTPS.",
    )
    .transform((value) => value.replace(/\/+$/, "")),

  R2_ACCESS_KEY_ID: z
    .string()
    .trim()
    .min(1, "R2_ACCESS_KEY_ID belum dikonfigurasi."),

  R2_SECRET_ACCESS_KEY: z
    .string()
    .trim()
    .min(1, "R2_SECRET_ACCESS_KEY belum dikonfigurasi."),

  R2_BUCKET_NAME: z
    .string()
    .trim()
    .min(3, "R2_BUCKET_NAME belum dikonfigurasi."),

  R2_PUBLIC_BASE_URL: z
    .string()
    .trim()
    .url("R2_PUBLIC_BASE_URL tidak valid.")
    .transform((value) => value.replace(/\/+$/, "")),
});

const parsed = r2EnvironmentSchema.safeParse({
  R2_ENDPOINT: process.env.R2_ENDPOINT,

  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,

  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,

  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,

  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => issue.message).join(" ");

  throw new Error(`Konfigurasi Cloudflare R2 tidak valid. ${issues}`);
}

export const r2Env = parsed.data;
