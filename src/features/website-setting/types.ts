export type WebsiteSettingFieldName =
  | "defaultTitle"
  | "defaultDescription"
  | "keywords"
  | "openGraphImageUrl"
  | "allowIndexing"
  | "googleSiteVerification"
  | "twitterHandle";

export type WebsiteSettingValues = {
  defaultTitle: string;
  defaultDescription: string;
  keywords: string;
  openGraphImageUrl: string;
  allowIndexing: boolean;
  googleSiteVerification: string;
  twitterHandle: string;
};

export type WebsiteSettingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<WebsiteSettingFieldName, string[]>>;
};

export const initialWebsiteSettingActionState: WebsiteSettingActionState = {
  status: "idle",
};
