export type SocialLinkFieldName =
  "platform" | "label" | "url" | "sortOrder" | "isActive";

export type SocialLinkActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<SocialLinkFieldName, string[]>>;
  socialLinkId?: string;
};

export const initialSocialLinkActionState: SocialLinkActionState = {
  status: "idle",
};
