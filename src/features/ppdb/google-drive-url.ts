const GOOGLE_DRIVE_HOSTNAMES = new Set(["drive.google.com", "docs.google.com"]);

export function normalizePpdbGoogleDriveUrl(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== "https:") {
      return null;
    }

    if (!GOOGLE_DRIVE_HOSTNAMES.has(hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
