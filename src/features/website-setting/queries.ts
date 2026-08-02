import { cache } from "react";

import { prisma } from "@/lib/prisma";

import {
  legacyWebsiteSettingKeys,
  websiteSettingKeys,
  websiteSettingReadKeyList,
} from "./constants";
import type { WebsiteSettingValues } from "./types";

export const defaultWebsiteSettingValues: WebsiteSettingValues = {
  defaultTitle: "",
  defaultDescription: "",
  keywords: "",
  openGraphImageUrl: "",
  allowIndexing: true,
  googleSiteVerification: "",
  twitterHandle: "",

  heroPrimaryCtaLabel: "Informasi PPDB",
  heroSecondaryCtaLabel: "Mengenal Sekolah",
  homeStatsStudents: 0,
  homeStatsTeachers: 0,
  homeStatsPrograms: 0,
  homeStatsAchievements: 0,

  contactFormEnabled: true,
  showFloatingWhatsapp: true,

  privacyPolicyText: "",
};

type SettingRecord = {
  key: string;
  value: unknown;
};

function getRawValue(
  settings: Map<string, unknown>,
  key: string,
  legacyKey?: string,
): unknown {
  if (settings.has(key)) {
    return settings.get(key);
  }

  return legacyKey ? settings.get(legacyKey) : undefined;
}

function getStringValue(
  settings: Map<string, unknown>,
  key: string,
  legacyKey?: string,
  fallback = "",
): string {
  const value = getRawValue(settings, key, legacyKey);

  return typeof value === "string" ? value : fallback;
}

function getBooleanValue(
  settings: Map<string, unknown>,
  key: string,
  legacyKey: string | undefined,
  fallback: boolean,
): boolean {
  const value = getRawValue(settings, key, legacyKey);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return fallback;
}

function getNumberValue(
  settings: Map<string, unknown>,
  key: string,
  legacyKey?: string,
): number {
  const value = getRawValue(settings, key, legacyKey);

  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.trunc(parsed);
    }
  }

  return 0;
}

function mapSettings(records: SettingRecord[]): WebsiteSettingValues {
  const settings = new Map(records.map((record) => [record.key, record.value]));

  return {
    defaultTitle: getStringValue(
      settings,
      websiteSettingKeys.defaultTitle,
      legacyWebsiteSettingKeys.defaultTitle,
    ),

    defaultDescription: getStringValue(
      settings,
      websiteSettingKeys.defaultDescription,
      legacyWebsiteSettingKeys.defaultDescription,
    ),

    keywords: getStringValue(
      settings,
      websiteSettingKeys.keywords,
      legacyWebsiteSettingKeys.keywords,
    ),

    openGraphImageUrl: getStringValue(
      settings,
      websiteSettingKeys.openGraphImageUrl,
      legacyWebsiteSettingKeys.openGraphImageUrl,
    ),

    allowIndexing: getBooleanValue(
      settings,
      websiteSettingKeys.allowIndexing,
      legacyWebsiteSettingKeys.allowIndexing,
      true,
    ),

    googleSiteVerification: getStringValue(
      settings,
      websiteSettingKeys.googleSiteVerification,
    ),

    twitterHandle: getStringValue(settings, websiteSettingKeys.twitterHandle),

    heroPrimaryCtaLabel: getStringValue(
      settings,
      websiteSettingKeys.heroPrimaryCtaLabel,
      legacyWebsiteSettingKeys.heroPrimaryCtaLabel,
      defaultWebsiteSettingValues.heroPrimaryCtaLabel,
    ),

    heroSecondaryCtaLabel: getStringValue(
      settings,
      websiteSettingKeys.heroSecondaryCtaLabel,
      legacyWebsiteSettingKeys.heroSecondaryCtaLabel,
      defaultWebsiteSettingValues.heroSecondaryCtaLabel,
    ),

    homeStatsStudents: getNumberValue(
      settings,
      websiteSettingKeys.homeStatsStudents,
      legacyWebsiteSettingKeys.homeStatsStudents,
    ),

    homeStatsTeachers: getNumberValue(
      settings,
      websiteSettingKeys.homeStatsTeachers,
      legacyWebsiteSettingKeys.homeStatsTeachers,
    ),

    homeStatsPrograms: getNumberValue(
      settings,
      websiteSettingKeys.homeStatsPrograms,
      legacyWebsiteSettingKeys.homeStatsPrograms,
    ),

    homeStatsAchievements: getNumberValue(
      settings,
      websiteSettingKeys.homeStatsAchievements,
      legacyWebsiteSettingKeys.homeStatsAchievements,
    ),

    contactFormEnabled: getBooleanValue(
      settings,
      websiteSettingKeys.contactFormEnabled,
      legacyWebsiteSettingKeys.contactFormEnabled,
      true,
    ),

    showFloatingWhatsapp: getBooleanValue(
      settings,
      websiteSettingKeys.showFloatingWhatsapp,
      legacyWebsiteSettingKeys.showFloatingWhatsapp,
      true,
    ),

    privacyPolicyText: getStringValue(
      settings,
      websiteSettingKeys.privacyPolicyText,
      legacyWebsiteSettingKeys.privacyPolicyText,
    ),
  };
}

async function loadWebsiteSettings({
  publicOnly,
}: {
  publicOnly: boolean;
}): Promise<WebsiteSettingValues> {
  try {
    const records = await prisma.websiteSetting.findMany({
      where: {
        key: {
          in: websiteSettingReadKeyList,
        },
        ...(publicOnly
          ? {
              isPublic: true,
            }
          : {}),
      },
      select: {
        key: true,
        value: true,
      },
    });

    return mapSettings(records);
  } catch (error) {
    console.error("Gagal membaca pengaturan website.", error);

    return defaultWebsiteSettingValues;
  }
}

export const getPublicWebsiteSettings = cache(
  async (): Promise<WebsiteSettingValues> => {
    return loadWebsiteSettings({
      publicOnly: true,
    });
  },
);

export async function getPublicWebsiteSettingsUncached(): Promise<WebsiteSettingValues> {
  return loadWebsiteSettings({
    publicOnly: true,
  });
}

export async function getAdminWebsiteSettings(): Promise<WebsiteSettingValues> {
  return loadWebsiteSettings({
    publicOnly: false,
  });
}
