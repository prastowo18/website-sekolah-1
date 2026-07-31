function isGoogleMapsHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  return (
    normalized === "google.com" ||
    normalized.endsWith(".google.com") ||
    normalized === "maps.app.goo.gl" ||
    normalized === "goo.gl" ||
    /^maps\.google\.[a-z.]+$/.test(normalized) ||
    /^www\.google\.[a-z.]+$/.test(normalized)
  );
}

function extractIframeSource(value: string): string | null {
  const match = value.match(/\bsrc\s*=\s*["']([^"']+)["']/i);

  return match?.[1]?.replaceAll("&amp;", "&") ?? null;
}

export function normalizeGoogleMapsUrl(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const candidate = trimmedValue.includes("<iframe")
    ? extractIframeSource(trimmedValue)
    : trimmedValue;

  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== "https:") {
      return null;
    }

    if (!isGoogleMapsHostname(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
