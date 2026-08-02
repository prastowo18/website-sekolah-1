export type WebsiteSettingFieldName =
  | "defaultTitle"
  | "defaultDescription"
  | "keywords"
  | "openGraphImageUrl"
  | "allowIndexing"
  | "googleSiteVerification"
  | "twitterHandle"
  | "heroPrimaryCtaLabel"
  | "heroSecondaryCtaLabel"
  | "homeStatsStudents"
  | "homeStatsTeachers"
  | "homeStatsPrograms"
  | "homeStatsAchievements"
  | "contactFormEnabled"
  | "showFloatingWhatsapp"
  | "privacyPolicyText";

export type WebsiteSettingValues = {
  defaultTitle: string;
  defaultDescription: string;
  keywords: string;
  openGraphImageUrl: string;
  allowIndexing: boolean;
  googleSiteVerification: string;
  twitterHandle: string;

  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  homeStatsStudents: number;
  homeStatsTeachers: number;
  homeStatsPrograms: number;
  homeStatsAchievements: number;

  contactFormEnabled: boolean;
  showFloatingWhatsapp: boolean;

  privacyPolicyText: string;
};

export type WebsiteSettingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<WebsiteSettingFieldName, string[]>>;
};

export const initialWebsiteSettingActionState: WebsiteSettingActionState = {
  status: "idle",
};
