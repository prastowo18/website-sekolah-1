import { SkipToContent } from "@/components/public/skip-to-content";
import type { Metadata } from "next";

import { FloatingWhatsAppButton } from "@/components/public/floating-whatsapp-button";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavigation } from "@/components/public/public-navigation";
import { getPublicSiteChrome } from "@/features/public-site/queries";
import { getActivePublicPpdb } from "@/features/ppdb/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPublicSiteChrome();

  const schoolName = profile?.schoolName ?? "Sekolah Dasar";

  return {
    title: {
      default: schoolName,
      template: `%s | ${schoolName}`,
    },
    description: profile?.shortDescription ?? `Website resmi ${schoolName}.`,
    icons: profile?.faviconUrl
      ? {
          icon: getSafePublicUrl(profile.faviconUrl) ?? undefined,
        }
      : undefined,
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

      <PublicFooter profile={publicProfile} socialLinks={socialLinks} />

      {publicProfile.whatsapp ? (
        <FloatingWhatsAppButton
          phone={publicProfile.whatsapp}
          schoolName={publicProfile.schoolName}
        />
      ) : null}
    </>
  );
}

export const viewport = {
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR?.trim() ?? "#0f172a",
  colorScheme: "light",
};
