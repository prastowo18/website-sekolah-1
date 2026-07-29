import { z } from "zod";

function normalizeOptionalString(
  value: unknown,
): unknown {
  if (
    typeof value === "string" &&
    value.trim() === ""
  ) {
    return undefined;
  }

  return value;
}

const optionalEmailSchema =
  z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .trim()
      .email(
        "Format email tidak valid.",
      )
      .max(
        180,
        "Email terlalu panjang.",
      )
      .optional(),
  );

const optionalPhoneSchema =
  z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .trim()
      .min(
        8,
        "Nomor telepon terlalu pendek.",
      )
      .max(
        30,
        "Nomor telepon terlalu panjang.",
      )
      .regex(
        /^[0-9+\-().\s]+$/,
        "Nomor telepon tidak valid.",
      )
      .optional(),
  );

const optionalSubjectSchema =
  z.preprocess(
    normalizeOptionalString,
    z
      .string()
      .trim()
      .max(
        220,
        "Subjek terlalu panjang.",
      )
      .optional(),
  );

export const publicContactMessageSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(
          2,
          "Nama minimal 2 karakter.",
        )
        .max(
          160,
          "Nama terlalu panjang.",
        ),

      email: optionalEmailSchema,

      phone: optionalPhoneSchema,

      subject: optionalSubjectSchema,

      message: z
        .string()
        .trim()
        .min(
          20,
          "Pesan minimal 20 karakter.",
        )
        .max(
          3000,
          "Pesan maksimal 3.000 karakter.",
        ),

      website: z
        .string()
        .trim()
        .max(300)
        .optional()
        .default(""),

      startedAt: z
        .string()
        .trim()
        .max(30)
        .optional()
        .default(""),
    })
    .superRefine(
      (value, context) => {
        if (
          !value.email &&
          !value.phone
        ) {
          context.addIssue({
            code: "custom",
            path: ["email"],
            message:
              "Isi email atau nomor telepon.",
          });

          context.addIssue({
            code: "custom",
            path: ["phone"],
            message:
              "Isi email atau nomor telepon.",
          });
        }
      },
    );
