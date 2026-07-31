export const socialLinkPlatformSuggestions = [
  "INSTAGRAM",
  "FACEBOOK",
  "YOUTUBE",
  "TIKTOK",
  "X",
  "TWITTER",
  "LINKEDIN",
  "THREADS",
  "WHATSAPP",
  "TELEGRAM",
  "WEBSITE",
] as const;

const platformLabels: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  X: "X",
  TWITTER: "Twitter",
  LINKEDIN: "LinkedIn",
  THREADS: "Threads",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  WEBSITE: "Website",
};

const platformIcons: Record<string, string> = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  YOUTUBE: "youtube",
  TIKTOK: "music",
  X: "twitter",
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  THREADS: "at-sign",
  WHATSAPP: "message-circle",
  TELEGRAM: "send",
  WEBSITE: "globe",
};

export function getSocialLinkPlatformLabel(platform: string): string {
  return (
    platformLabels[platform] ??
    platform
      .toLowerCase()
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function getSocialLinkIconName(platform: string): string {
  return platformIcons[platform] ?? "link";
}
