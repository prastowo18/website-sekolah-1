import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";

type NormalizedSocialLink = {
  href: string;
  label: string;
};

type FooterSocialLinksProps = {
  links: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function normalizeHref(value: string): string | null {
  const href = value.trim();

  if (!href) {
    return null;
  }

  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  if (/^www\./i.test(href)) {
    return `https://${href}`;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(href)) {
    return `https://${href}`;
  }

  return null;
}

function normalizeSocialLinks(input: unknown): NormalizedSocialLink[] {
  const candidates: Array<{
    fallbackLabel?: string;
    value: unknown;
  }> = [];

  if (Array.isArray(input)) {
    input.forEach((value) => {
      candidates.push({ value });
    });
  } else if (isRecord(input)) {
    Object.entries(input).forEach(([fallbackLabel, value]) => {
      candidates.push({
        fallbackLabel,
        value,
      });
    });
  }

  const normalized: NormalizedSocialLink[] = [];
  const usedHrefs = new Set<string>();

  for (const candidate of candidates) {
    let rawHref: string | null = null;
    let rawLabel: string | null = candidate.fallbackLabel ?? null;

    if (typeof candidate.value === "string") {
      rawHref = candidate.value;
    } else if (isRecord(candidate.value)) {
      const record = candidate.value;

      const activeValue = record.isActive ?? record.active ?? record.enabled;

      if (activeValue === false) {
        continue;
      }

      rawHref = readString(record, ["url", "href", "link", "value", "website"]);

      rawLabel =
        readString(record, [
          "label",
          "name",
          "platform",
          "type",
          "title",
          "socialMedia",
          "socialName",
        ]) ?? rawLabel;
    }

    if (!rawHref) {
      continue;
    }

    const href = normalizeHref(rawHref);

    if (!href || usedHrefs.has(href)) {
      continue;
    }

    usedHrefs.add(href);

    normalized.push({
      href,
      label: rawLabel?.trim() || new URL(href).hostname.replace(/^www\./, ""),
    });
  }

  return normalized;
}

function getSocialIcon(label: string, href: string): IconType {
  const value = `${label} ${href}`.toLowerCase();

  if (value.includes("facebook") || value.includes("fb.com")) {
    return FaFacebookF;
  }

  if (value.includes("instagram")) {
    return FaInstagram;
  }

  if (value.includes("youtube") || value.includes("youtu.be")) {
    return FaYoutube;
  }

  if (value.includes("tiktok")) {
    return FaTiktok;
  }

  if (value.includes("twitter") || value.includes("x.com")) {
    return FaXTwitter;
  }

  if (value.includes("linkedin")) {
    return FaLinkedinIn;
  }

  if (value.includes("whatsapp") || value.includes("wa.me")) {
    return FaWhatsapp;
  }

  return FaGlobe;
}

export function FooterSocialLinks({ links }: FooterSocialLinksProps) {
  const socialLinks = normalizeSocialLinks(links);

  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="footer-social-links-title"
      className="border-t border-white/10 py-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="footer-social-links-title"
          className="text-sm font-semibold text-white"
        >
          Ikuti media sosial sekolah
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {socialLinks.map((socialLink) => {
            const SocialIcon = getSocialIcon(socialLink.label, socialLink.href);

            return (
              <a
                key={socialLink.href}
                href={socialLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka ${socialLink.label}`}
                title={socialLink.label}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <SocialIcon aria-hidden="true" className="size-4" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
