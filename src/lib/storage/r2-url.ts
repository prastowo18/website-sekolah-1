import "server-only";

import { r2Env } from "./r2-env";

export function getR2PublicUrl(objectKey: string): string {
  const normalizedKey = objectKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${r2Env.R2_PUBLIC_BASE_URL}/${normalizedKey}`;
}
