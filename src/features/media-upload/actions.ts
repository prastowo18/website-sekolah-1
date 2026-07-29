"use server";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import { requireAdminSession } from "@/lib/auth/require-session";
import { r2BucketName, r2Client } from "@/lib/storage/r2-client";
import { getR2PublicUrl } from "@/lib/storage/r2-url";

import { MEDIA_TYPE_RULES, type AllowedMediaType } from "./constants";
import { createMediaUploadSchema, finalizeMediaUploadSchema } from "./schemas";
import type {
  CreateMediaUploadInput,
  CreateMediaUploadResult,
  FinalizeMediaUploadInput,
  FinalizeMediaUploadResult,
} from "./types";

const PRESIGNED_URL_DURATION_SECONDS = 5 * 60;

class MediaValidationError extends Error {}

function canManageMedia(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "CONTENT_ADMIN";
}

function bytesStartWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[index] === value);
}

function bytesToAscii(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) => String.fromCharCode(value))
    .join("");
}

function hasValidFileSignature(
  contentType: AllowedMediaType,
  bytes: Uint8Array,
): boolean {
  if (contentType === "image/jpeg") {
    return bytesStartWith(bytes, [0xff, 0xd8, 0xff]);
  }

  if (contentType === "image/png") {
    return bytesStartWith(
      bytes,
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    );
  }

  if (contentType === "image/webp") {
    if (bytes.length < 12) {
      return false;
    }

    const riff = bytesToAscii(bytes.slice(0, 4));

    const webp = bytesToAscii(bytes.slice(8, 12));

    return riff === "RIFF" && webp === "WEBP";
  }

  if (contentType === "image/avif") {
    if (bytes.length < 16) {
      return false;
    }

    const boxType = bytesToAscii(bytes.slice(4, 8));

    const brands = bytesToAscii(bytes.slice(8, 32));

    return (
      boxType === "ftyp" && (brands.includes("avif") || brands.includes("avis"))
    );
  }

  if (contentType === "application/pdf") {
    return bytesStartWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }

  return false;
}

async function deleteTemporaryObject(temporaryKey: string): Promise<void> {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: temporaryKey,
      }),
    );
  } catch (error) {
    console.error("Delete temporary R2 object failed:", error);
  }
}

export async function createMediaUploadAction(
  input: CreateMediaUploadInput,
): Promise<CreateMediaUploadResult> {
  const session = await requireAdminSession();

  if (!canManageMedia(session.user.role)) {
    return {
      status: "error",
      message: "Akun Anda tidak memiliki izin untuk mengunggah media.",
    };
  }

  const parsed = createMediaUploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data upload tidak valid.",
    };
  }

  const { directory, contentType } = parsed.data;

  const rule = MEDIA_TYPE_RULES[contentType];

  const now = new Date();

  const year = String(now.getUTCFullYear());

  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  const identifier = randomUUID();

  const uploadToken = randomUUID();

  const temporaryKey = [
    "temporary",
    directory,
    year,
    month,
    `${identifier}.${rule.extension}`,
  ].join("/");

  try {
    const uploadUrl = await getSignedUrl(
      r2Client,

      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: temporaryKey,
        ContentType: contentType,

        Metadata: {
          "upload-token": uploadToken,
        },
      }),

      {
        expiresIn: PRESIGNED_URL_DURATION_SECONDS,
        unhoistableHeaders: new Set(["x-amz-meta-upload-token"]),
      },
    );

    return {
      status: "success",
      uploadUrl,
      temporaryKey,
      uploadToken,

      expiresAt: new Date(
        Date.now() + PRESIGNED_URL_DURATION_SECONDS * 1000,
      ).toISOString(),
    };
  } catch (error) {
    console.error("Create R2 presigned URL failed:", error);

    return {
      status: "error",
      message: "URL upload belum dapat dibuat.",
    };
  }
}

export async function finalizeMediaUploadAction(
  input: FinalizeMediaUploadInput,
): Promise<FinalizeMediaUploadResult> {
  const session = await requireAdminSession();

  if (!canManageMedia(session.user.role)) {
    return {
      status: "error",
      message: "Akun Anda tidak memiliki izin untuk memproses media.",
    };
  }

  const parsed = finalizeMediaUploadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Data verifikasi tidak valid.",
    };
  }

  const { temporaryKey, uploadToken, expectedContentType, expectedSize } =
    parsed.data;

  const rule = MEDIA_TYPE_RULES[expectedContentType];

  try {
    const head = await r2Client.send(
      new HeadObjectCommand({
        Bucket: r2BucketName,

        Key: temporaryKey,
      }),
    );

    const storedToken = head.Metadata?.["upload-token"];

    if (storedToken !== uploadToken) {
      throw new MediaValidationError("Token object tidak sesuai.");
    }

    if (head.ContentType !== expectedContentType) {
      throw new MediaValidationError("Content-Type object tidak sesuai.");
    }

    if (head.ContentLength !== expectedSize) {
      throw new MediaValidationError("Ukuran object tidak sesuai.");
    }

    if (expectedSize > rule.maxBytes) {
      throw new MediaValidationError("Ukuran object melampaui batas.");
    }

    const object = await r2Client.send(
      new GetObjectCommand({
        Bucket: r2BucketName,

        Key: temporaryKey,

        Range: "bytes=0-31",
      }),
    );

    if (!object.Body) {
      throw new Error("Isi object tidak tersedia.");
    }

    const signatureBytes = await object.Body.transformToByteArray();

    if (!hasValidFileSignature(expectedContentType, signatureBytes)) {
      throw new MediaValidationError(
        "Isi file tidak sesuai dengan format yang dipilih.",
      );
    }

    const objectKey = temporaryKey.replace(/^temporary\//, "");

    await r2Client.send(
      new CopyObjectCommand({
        Bucket: r2BucketName,
        Key: objectKey,

        CopySource: `${r2BucketName}/${temporaryKey}`,

        ContentType: expectedContentType,

        ContentDisposition: "inline",

        CacheControl: "public, max-age=31536000, immutable",

        MetadataDirective: "REPLACE",

        Metadata: {
          validated: "true",
        },
      }),
    );

    await deleteTemporaryObject(temporaryKey);

    return {
      status: "success",
      message: "Media berhasil diunggah dan diverifikasi.",
      objectKey,

      publicUrl: getR2PublicUrl(objectKey),

      contentType: expectedContentType,

      size: expectedSize,
    };
  } catch (error) {
    if (error instanceof MediaValidationError) {
      await deleteTemporaryObject(temporaryKey);

      console.warn("R2 media validation rejected:", error.message);

      return {
        status: "error",
        message: "File ditolak karena format atau isinya tidak valid.",
      };
    }

    console.error("Finalize R2 media upload failed:", error);

    return {
      status: "error",
      message: "Media belum dapat diverifikasi. Silakan coba kembali.",
    };
  }
}
