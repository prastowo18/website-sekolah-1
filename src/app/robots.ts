import type { MetadataRoute } from "next";

import { getSiteOrigin, isIndexableDeployment } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = getSiteOrigin();

  if (!isIndexableDeployment()) {
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
        disallow: ["/admin/", "/login", "/ubah-password", "/api/"],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
    host: siteOrigin,
  };
}
