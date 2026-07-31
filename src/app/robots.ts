import type { MetadataRoute } from "next";

import { getPublicWebsiteSettings } from "@/features/website-setting/queries";
import { getSiteOrigin, isIndexableDeployment } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteOrigin = getSiteOrigin();

  const settings = await getPublicWebsiteSettings();

  const allowIndexing = isIndexableDeployment() && settings.allowIndexing;

  if (!allowIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/konsol-8m4q7x2k9v6d/",
          "/admin/",
          "/login",
          "/ubah-password",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
