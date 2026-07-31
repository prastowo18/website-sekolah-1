export const websiteSettingKeys = {
  defaultTitle: "seo.defaultTitle",
  defaultDescription: "seo.defaultDescription",
  keywords: "seo.keywords",
  openGraphImageUrl: "seo.openGraphImageUrl",
  allowIndexing: "seo.allowIndexing",
  googleSiteVerification: "seo.googleSiteVerification",
  twitterHandle: "seo.twitterHandle",
} as const;

export type WebsiteSettingKey =
  (typeof websiteSettingKeys)[keyof typeof websiteSettingKeys];

export const websiteSettingKeyList = Object.values(websiteSettingKeys);
