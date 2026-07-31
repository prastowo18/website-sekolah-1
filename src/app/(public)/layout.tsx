import type { Metadata } from "next";

import { PublicMotionProvider } from "@/components/motion/public-motion-provider";
import { FloatingWhatsAppButton } from "@/components/public/floating-whatsapp-button";
import { PublicFooterMotion } from "@/components/motion/public-footer-motion";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavigation } from "@/components/public/public-navigation";
import { SkipToContent } from "@/components/public/skip-to-content";
import { getPublicSiteChrome } from "@/features/public-site/queries";
import { getActivePublicPpdb } from "@/features/ppdb/public-queries";
import { getPublicWebsiteSettings } from "@/features/website-setting/queries";
import { getSafePublicUrl } from "@/lib/public-links";

function parseKeywords(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 50);
}

export async function generateMetadata(): Promise<Metadata> {
  const [{ profile }, settings] = await Promise.all([
    getPublicSiteChrome(),
    getPublicWebsiteSettings(),
  ]);

  const schoolName = profile?.schoolName ?? "Sekolah Dasar";

  const defaultTitle = settings.defaultTitle || schoolName;

  const description =
    settings.defaultDescription ||
    profile?.shortDescription ||
    `Website resmi ${schoolName}.`;

  const configuredSocialImage = getSafePublicUrl(settings.openGraphImageUrl);

  const fallbackSocialImage = getSafePublicUrl(
    profile?.heroImageUrl || profile?.logoUrl || "",
  );

  const socialImage = configuredSocialImage || fallbackSocialImage || undefined;

  const keywords = parseKeywords(settings.keywords);

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${schoolName}`,
    },

    description,

    keywords: keywords.length > 0 ? keywords : undefined,

    icons: profile?.faviconUrl
      ? {
          icon: getSafePublicUrl(profile.faviconUrl) ?? undefined,
        }
      : undefined,

    robots: settings.allowIndexing
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          nocache: true,
        },

    verification: settings.googleSiteVerification
      ? {
          google: settings.googleSiteVerification,
        }
      : undefined,

    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: schoolName,
      title: defaultTitle,
      description,
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: schoolName,
            },
          ]
        : undefined,
    },

    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: defaultTitle,
      description,
      site: settings.twitterHandle || undefined,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [{ profile, socialLinks }, ppdb] = await Promise.all([
    getPublicSiteChrome(),
    getActivePublicPpdb(),
  ]);

  const publicProfile = profile ?? {
    schoolName: "Sekolah Dasar",
    shortName: null,
    npsn: null,
    logoUrl: null,
    accreditation: null,
    tagline: null,
    address: null,
    village: null,
    district: null,
    city: null,
    province: null,
    postalCode: null,
    phone: null,
    whatsapp: null,
    email: null,
    operationalHours: null,
  };

  return (
    <PublicMotionProvider>
      <>
        <SkipToContent />

        <PublicNavigation
          schoolName={publicProfile.schoolName}
          shortName={publicProfile.shortName}
          logoUrl={profile?.logoUrl ?? null}
          hasPpdb={ppdb !== null}
        />

        <div id="main-content" tabIndex={-1}>
          {children}
        </div>

        <PublicFooterMotion>
          <PublicFooter profile={publicProfile} socialLinks={socialLinks} />
        </PublicFooterMotion>

        {publicProfile.whatsapp ? (
          <FloatingWhatsAppButton
            phone={publicProfile.whatsapp}
            schoolName={publicProfile.schoolName}
          />
        ) : null}
      </>
    </PublicMotionProvider>
  );
}

export const viewport = {
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR?.trim() ?? "#0f172a",
  colorScheme: "light",
};
