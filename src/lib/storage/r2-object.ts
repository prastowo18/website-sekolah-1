import "server-only";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { r2BucketName, r2Client } from "./r2-client";
import { r2Env } from "./r2-env";

const publicBaseUrl = new URL(`${r2Env.R2_PUBLIC_BASE_URL}/`);

function getBasePath(): string {
  const pathname = publicBaseUrl.pathname;

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function getR2ObjectKeyFromPublicUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== publicBaseUrl.protocol ||
    url.host !== publicBaseUrl.host
  ) {
    return null;
  }

  const basePath = getBasePath();

  if (!url.pathname.startsWith(basePath)) {
    return null;
  }

  const encodedKey = url.pathname.slice(basePath.length);

  if (!encodedKey) {
    return null;
  }

  const encodedSegments = encodedKey.split("/");

  const decodedSegments: string[] = [];

  for (const encodedSegment of encodedSegments) {
    if (!encodedSegment) {
      return null;
    }

    let decodedSegment: string;

    try {
      decodedSegment = decodeURIComponent(encodedSegment);
    } catch {
      return null;
    }

    if (
      !decodedSegment ||
      decodedSegment === "." ||
      decodedSegment === ".." ||
      decodedSegment.includes("/") ||
      decodedSegment.includes("\\") ||
      decodedSegment.includes("\0")
    ) {
      return null;
    }

    decodedSegments.push(decodedSegment);
  }

  return decodedSegments.join("/");
}

export async function deleteR2ObjectByKey(objectKey: string): Promise<void> {
  if (!objectKey.trim()) {
    throw new Error("Object key R2 tidak valid.");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: r2BucketName,
      Key: objectKey,
    }),
  );
}
