import "server-only";

import { headers } from "next/headers";

export type AuditRequestContext = {
  ipAddress: string | null;
  userAgent: string | null;
};

function firstForwardedAddress(value: string | null): string | null {
  const address = value?.split(",")[0]?.trim();

  return address ? address.slice(0, 64) : null;
}

export async function getAuditRequestContext(): Promise<AuditRequestContext> {
  const requestHeaders = await headers();

  const ipAddress =
    firstForwardedAddress(requestHeaders.get("cf-connecting-ip")) ??
    firstForwardedAddress(requestHeaders.get("x-vercel-forwarded-for")) ??
    firstForwardedAddress(requestHeaders.get("x-forwarded-for")) ??
    firstForwardedAddress(requestHeaders.get("x-real-ip"));

  const userAgent = requestHeaders.get("user-agent")?.trim().slice(0, 2000);

  return {
    ipAddress,
    userAgent: userAgent || null,
  };
}
