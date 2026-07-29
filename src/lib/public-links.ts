export function getSafePublicUrl(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizeIndonesianPhone(value: string): string {
  const normalized = value.replace(/[^\d+]/g, "");

  if (normalized.startsWith("+")) {
    return normalized.slice(1);
  }

  if (normalized.startsWith("0")) {
    return `62${normalized.slice(1)}`;
  }

  return normalized;
}

export function toWhatsAppHref(phone: string, message?: string): string {
  const normalized = normalizeIndonesianPhone(phone);

  const parameters = new URLSearchParams();

  if (message) {
    parameters.set("text", message);
  }

  const query = parameters.toString();

  return `https://wa.me/${normalized}${query ? `?${query}` : ""}`;
}

export function toPhoneHref(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, "");

  return `tel:${normalized}`;
}
