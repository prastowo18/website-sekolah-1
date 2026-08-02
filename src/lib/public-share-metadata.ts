import type { Metadata } from "next";

import { getPublicWebsiteSettings } from "@/features/website-setting/queries";
import { getSafePublicUrl } from "@/lib/public-links";
import { getSiteOrigin } from "@/lib/site-url";

type PublicShareMetadataInput = {
  baseMetadata: Metadata;
  pathname: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  type?: "article" | "website";
};

function metadataTitleToString(title: Metadata["title"]): string | undefined {
  if (typeof title === "string") {
    return title;
  }

  if (
    title &&
    typeof title === "object" &&
    "absolute" in title &&
    typeof title.absolute === "string"
  ) {
    return title.absolute;
  }

  return undefined;
}

function toAbsolutePublicUrl(value: string | null | undefined): string | null {
  const safeValue = getSafePublicUrl(value);

  if (!safeValue) {
    return null;
  }

  try {
    return new URL(safeValue, `${getSiteOrigin()}/`).toString();
  } catch {
    return null;
  }
}

function createPageUrl(pathname: string): string {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  return new URL(normalizedPathname, `${getSiteOrigin()}/`).toString();
}

export async function buildPublicShareMetadata({
  baseMetadata,
  pathname,
  imageUrl,
  imageAlt,
  type = "website",
}: PublicShareMetadataInput): Promise<Metadata> {
  const settings = await getPublicWebsiteSettings();

  const title =
    metadataTitleToString(baseMetadata.title) ||
    settings.defaultTitle ||
    "Website Sekolah";

  const description =
    baseMetadata.description ||
    settings.defaultDescription ||
    "Informasi resmi sekolah.";

  const canonicalUrl = createPageUrl(pathname);

  const resolvedImageUrl =
    toAbsolutePublicUrl(imageUrl) ||
    toAbsolutePublicUrl(settings.openGraphImageUrl);

  const resolvedImageAlt = imageAlt?.trim() || title;

  return {
    ...baseMetadata,
    alternates: {
      ...(baseMetadata.alternates ?? {}),
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type,
      siteName: settings.defaultTitle || undefined,
      images: resolvedImageUrl
        ? [
            {
              url: resolvedImageUrl,
              alt: resolvedImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: resolvedImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      site: settings.twitterHandle || undefined,
      images: resolvedImageUrl ? [resolvedImageUrl] : undefined,
    },
  };
}
