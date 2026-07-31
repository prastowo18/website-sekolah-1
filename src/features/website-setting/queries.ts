import { cache } from "react";

import { prisma } from "@/lib/prisma";

import { websiteSettingKeyList, websiteSettingKeys } from "./constants";
import type { WebsiteSettingValues } from "./types";

export const defaultWebsiteSettingValues: WebsiteSettingValues = {
  defaultTitle: "",
  defaultDescription: "",
  keywords: "",
  openGraphImageUrl: "",
  allowIndexing: true,
  googleSiteVerification: "",
  twitterHandle: "",
};

type SettingRecord = {
  key: string;
  value: unknown;
};

function getStringValue(settings: Map<string, unknown>, key: string): string {
  const value = settings.get(key);

  return typeof value === "string" ? value : "";
}

function getBooleanValue(
  settings: Map<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = settings.get(key);

  return typeof value === "boolean" ? value : fallback;
}

function mapSettings(records: SettingRecord[]): WebsiteSettingValues {
  const settings = new Map(records.map((record) => [record.key, record.value]));

  return {
    defaultTitle: getStringValue(settings, websiteSettingKeys.defaultTitle),

    defaultDescription: getStringValue(
      settings,
      websiteSettingKeys.defaultDescription,
    ),

    keywords: getStringValue(settings, websiteSettingKeys.keywords),

    openGraphImageUrl: getStringValue(
      settings,
      websiteSettingKeys.openGraphImageUrl,
    ),

    allowIndexing: getBooleanValue(
      settings,
      websiteSettingKeys.allowIndexing,
      true,
    ),

    googleSiteVerification: getStringValue(
      settings,
      websiteSettingKeys.googleSiteVerification,
    ),

    twitterHandle: getStringValue(settings, websiteSettingKeys.twitterHandle),
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
          in: websiteSettingKeyList,
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

export async function getAdminWebsiteSettings(): Promise<WebsiteSettingValues> {
  return loadWebsiteSettings({
    publicOnly: false,
  });
}
