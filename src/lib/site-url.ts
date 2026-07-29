const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): URL | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  try {
    const parsed = new URL(
      /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`,
    );

    return new URL(parsed.origin);
  } catch {
    return null;
  }
}

export function getSiteUrl(): URL {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    new URL(LOCAL_SITE_URL)
  );
}

export function getSiteOrigin(): string {
  return getSiteUrl().origin;
}

export function isIndexableDeployment(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  const vercelEnvironment = process.env.VERCEL_ENV;

  if (vercelEnvironment && vercelEnvironment !== "production") {
    return false;
  }

  return true;
}
