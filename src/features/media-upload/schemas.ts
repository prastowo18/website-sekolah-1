import { z } from "zod";

import {
  ALLOWED_MEDIA_TYPES,
  MEDIA_DIRECTORIES,
  MEDIA_KINDS,
  MEDIA_TYPE_RULES,
} from "./constants";

export const createMediaUploadSchema = z
  .object({
    directory: z.enum(MEDIA_DIRECTORIES),

    kind: z.enum(MEDIA_KINDS),

    originalName: z
      .string()
      .trim()
      .min(1, "Nama file tidak tersedia.")
      .max(255, "Nama file terlalu panjang."),

    contentType: z.enum(ALLOWED_MEDIA_TYPES),

    size: z.number().int().positive("Ukuran file tidak valid."),
  })
  .superRefine((value, context) => {
    const rule = MEDIA_TYPE_RULES[value.contentType];

    if (rule.kind !== value.kind) {
      context.addIssue({
        code: "custom",
        path: ["contentType"],
        message: "Jenis file tidak sesuai dengan kategori media.",
      });
    }

    if (value.size > rule.maxBytes) {
      context.addIssue({
        code: "custom",
        path: ["size"],
        message:
          value.kind === "image"
            ? "Ukuran gambar maksimal 5 MB."
            : "Ukuran dokumen maksimal 10 MB.",
      });
    }
  });

export const finalizeMediaUploadSchema = z.object({
  temporaryKey: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(
      /^temporary\/[a-z-]+\/\d{4}\/\d{2}\/[0-9a-f-]+\.[a-z0-9]+$/,
      "Lokasi file sementara tidak valid.",
    ),

  uploadToken: z.string().uuid("Token upload tidak valid."),

  expectedContentType: z.enum(ALLOWED_MEDIA_TYPES),

  expectedSize: z.number().int().positive("Ukuran file tidak valid."),
});
