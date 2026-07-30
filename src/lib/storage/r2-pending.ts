import "server-only";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

import type { MediaDirectory } from "@/features/media-upload/constants";

import { r2BucketName, r2Client } from "./r2-client";
import { getR2ObjectKeyFromPublicUrl } from "./r2-object";
import { getR2PublicUrl } from "./r2-url";

export class PendingMediaCommitError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "PendingMediaCommitError";
  }
}

export type PreparedMediaCommit = {
  pendingKey: string;
  finalKey: string;
  finalUrl: string;
};

function encodeCopySource(objectKey: string): string {
  const encodedKey = objectKey
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${encodeURIComponent(r2BucketName)}/${encodedKey}`;
}

export async function preparePendingMediaCommit(
  publicUrl: string | null | undefined,
  directory: MediaDirectory,
): Promise<PreparedMediaCommit | null> {
  const objectKey = getR2ObjectKeyFromPublicUrl(publicUrl);

  if (!objectKey) {
    return null;
  }

  if (!objectKey.startsWith("pending/")) {
    return null;
  }

  const requiredPrefix = `pending/${directory}/`;

  if (!objectKey.startsWith(requiredPrefix)) {
    throw new PendingMediaCommitError(
      "Media sementara berasal dari direktori yang tidak sesuai.",
    );
  }

  const finalKey = objectKey.slice("pending/".length);

  if (!finalKey.startsWith(`${directory}/`)) {
    throw new PendingMediaCommitError("Lokasi akhir media tidak valid.");
  }

  const sourceObject = await r2Client.send(
    new HeadObjectCommand({
      Bucket: r2BucketName,
      Key: objectKey,
    }),
  );

  if (sourceObject.Metadata?.validated !== "true") {
    throw new PendingMediaCommitError(
      "Media sementara belum lolos verifikasi.",
    );
  }

  if (sourceObject.Metadata?.directory !== directory) {
    throw new PendingMediaCommitError("Metadata direktori media tidak sesuai.");
  }

  await r2Client.send(
    new CopyObjectCommand({
      Bucket: r2BucketName,
      Key: finalKey,
      CopySource: encodeCopySource(objectKey),
    }),
  );

  return {
    pendingKey: objectKey,
    finalKey,
    finalUrl: getR2PublicUrl(finalKey),
  };
}

export async function completePreparedMediaCommit(
  prepared: PreparedMediaCommit | null,
): Promise<void> {
  if (!prepared) {
    return;
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: prepared.pendingKey,
      }),
    );
  } catch (error) {
    /*
     * Database sudah tersimpan dan object final sudah tersedia.
     * Pending yang gagal dihapus akan dibersihkan lifecycle R2.
     */
    console.error("Pending media cleanup failed:", {
      pendingKey: prepared.pendingKey,
      error,
    });
  }
}

export async function rollbackPreparedMediaCommit(
  prepared: PreparedMediaCommit | null,
): Promise<void> {
  if (!prepared) {
    return;
  }

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: r2BucketName,
        Key: prepared.finalKey,
      }),
    );
  } catch (error) {
    console.error("Pending media rollback failed:", {
      finalKey: prepared.finalKey,
      error,
    });
  }
}
