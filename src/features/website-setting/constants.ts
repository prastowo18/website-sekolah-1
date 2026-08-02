export const websiteSettingKeys = {
  defaultTitle: "seo.defaultTitle",
  defaultDescription: "seo.defaultDescription",
  keywords: "seo.keywords",
  openGraphImageUrl: "seo.openGraphImageUrl",
  allowIndexing: "seo.allowIndexing",
  googleSiteVerification: "seo.googleSiteVerification",
  twitterHandle: "seo.twitterHandle",

  heroPrimaryCtaLabel: "home.heroPrimaryCtaLabel",
  heroSecondaryCtaLabel: "home.heroSecondaryCtaLabel",
  homeStatsStudents: "home.statsStudents",
  homeStatsTeachers: "home.statsTeachers",
  homeStatsPrograms: "home.statsPrograms",
  homeStatsAchievements: "home.statsAchievements",

  contactFormEnabled: "contact.formEnabled",
  showFloatingWhatsapp: "contact.showFloatingWhatsapp",

  privacyPolicyText: "privacy.policyText",
} as const;

export const legacyWebsiteSettingKeys = {
  defaultTitle: "defaultTitle",
  defaultDescription: "defaultDescription",
  keywords: "keywords",
  openGraphImageUrl: "openGraphImageUrl",
  allowIndexing: "allowIndexing",

  heroPrimaryCtaLabel: "heroPrimaryCtaLabel",
  heroSecondaryCtaLabel: "heroSecondaryCtaLabel",
  homeStatsStudents: "homeStatsStudents",
  homeStatsTeachers: "homeStatsTeachers",
  homeStatsPrograms: "homeStatsPrograms",
  homeStatsAchievements: "homeStatsAchievements",

  contactFormEnabled: "contactFormEnabled",
  showFloatingWhatsapp: "showFloatingWhatsapp",

  privacyPolicyText: "privacyPolicyText",
} as const;

export type WebsiteSettingKey =
  (typeof websiteSettingKeys)[keyof typeof websiteSettingKeys];

export const websiteSettingKeyList = Object.values(websiteSettingKeys);

export const websiteSettingReadKeyList = Array.from(
  new Set([
    ...websiteSettingKeyList,
    ...Object.values(legacyWebsiteSettingKeys),
  ]),
);
