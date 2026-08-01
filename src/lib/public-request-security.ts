import { createHash } from "node:crypto";

type HeaderReader = {
  get(name: string): string | null;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type PublicRateLimitInput = {
  scope: string;
  key: string;
  windowMs: number;
  maxRequests: number;
};

const globalForPublicRequestSecurity = globalThis as typeof globalThis & {
  publicRequestRateLimits?: Map<string, RateLimitEntry>;
  publicRequestRateLimitOperations?: number;
};

const publicRequestRateLimits =
  globalForPublicRequestSecurity.publicRequestRateLimits ??
  new Map<string, RateLimitEntry>();

globalForPublicRequestSecurity.publicRequestRateLimits =
  publicRequestRateLimits;

function getClientAddress(headers: HeaderReader): string {
  const connectingIp = headers.get("cf-connecting-ip")?.trim();

  if (connectingIp) {
    return connectingIp;
  }

  const vercelForwardedFor = headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (vercelForwardedFor) {
    return vercelForwardedFor;
  }

  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (forwardedFor) {
    return forwardedFor;
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredRateLimits(now: number): void {
  const operations =
    (globalForPublicRequestSecurity.publicRequestRateLimitOperations ?? 0) + 1;

  globalForPublicRequestSecurity.publicRequestRateLimitOperations = operations;

  if (operations % 100 !== 0) {
    return;
  }

  for (const [key, entry] of publicRequestRateLimits.entries()) {
    if (entry.resetAt <= now) {
      publicRequestRateLimits.delete(key);
    }
  }
}

export function buildRequestFingerprint(headers: HeaderReader): string {
  const clientAddress = getClientAddress(headers);
  const userAgent = headers.get("user-agent")?.slice(0, 300) || "unknown";
  const acceptLanguage =
    headers.get("accept-language")?.slice(0, 120) || "unknown";

  return createHash("sha256")
    .update(`${clientAddress}|${userAgent}|${acceptLanguage}`)
    .digest("hex");
}

export function consumePublicRateLimit({
  scope,
  key,
  windowMs,
  maxRequests,
}: PublicRateLimitInput): boolean {
  const now = Date.now();

  pruneExpiredRateLimits(now);

  const storeKey = `${scope}:${key}`;
  const current = publicRequestRateLimits.get(storeKey);

  if (!current || current.resetAt <= now) {
    publicRequestRateLimits.set(storeKey, {
      count: 1,
      resetAt: now + windowMs,
    });

    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  publicRequestRateLimits.set(storeKey, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });

  return true;
}

export function isSameOriginRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");

  if (origin) {
    try {
      return new URL(origin).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");

  return (
    fetchSite === "same-origin" ||
    fetchSite === "same-site" ||
    fetchSite === "none"
  );
}
