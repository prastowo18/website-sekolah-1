"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  type Prisma,
  SettingValueType,
  UserRole,
} from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { websiteSettingKeyList, websiteSettingKeys } from "./constants";
import { websiteSettingSchema } from "./schemas";
import type {
  WebsiteSettingActionState,
  WebsiteSettingFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN] as const;

type SettingDefinition = {
  key: string;
  value: Prisma.InputJsonValue;
  valueType: SettingValueType;
  group: string;
  description: string;
};

function getFormValues(formData: FormData) {
  return {
    defaultTitle: formData.get("defaultTitle") ?? "",
    defaultDescription: formData.get("defaultDescription") ?? "",
    keywords: formData.get("keywords") ?? "",
    openGraphImageUrl: formData.get("openGraphImageUrl") ?? "",
    allowIndexing: formData.get("allowIndexing") ?? "",
    googleSiteVerification: formData.get("googleSiteVerification") ?? "",
    twitterHandle: formData.get("twitterHandle") ?? "",

    heroPrimaryCtaLabel: formData.get("heroPrimaryCtaLabel") ?? "",
    heroSecondaryCtaLabel: formData.get("heroSecondaryCtaLabel") ?? "",
    homeStatsStudents: formData.get("homeStatsStudents") ?? "0",
    homeStatsTeachers: formData.get("homeStatsTeachers") ?? "0",
    homeStatsPrograms: formData.get("homeStatsPrograms") ?? "0",
    homeStatsAchievements: formData.get("homeStatsAchievements") ?? "0",

    contactFormEnabled: formData.get("contactFormEnabled") ?? "",
    showFloatingWhatsapp: formData.get("showFloatingWhatsapp") ?? "",

    privacyPolicyText: formData.get("privacyPolicyText") ?? "",
  };
}

function validationErrorState(error: z.ZodError): WebsiteSettingActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data pengaturan website.",
    fieldErrors: errors as Partial<Record<WebsiteSettingFieldName, string[]>>,
  };
}

function revalidateWebsiteSettingPaths(): void {
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/kontak");
  revalidatePath("/kebijakan-privasi");
  revalidatePath("/robots.txt");
  revalidatePath("/sitemap.xml");
  revalidatePath("/konsol-8m4q7x2k9v6d/pengaturan");
}

export async function updateWebsiteSettingAction(
  _previousState: WebsiteSettingActionState,
  formData: FormData,
): Promise<WebsiteSettingActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = websiteSettingSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const settings: SettingDefinition[] = [
    {
      key: websiteSettingKeys.defaultTitle,
      value: parsed.data.defaultTitle,
      valueType: SettingValueType.STRING,
      group: "seo",
      description: "Judul SEO default website.",
    },
    {
      key: websiteSettingKeys.defaultDescription,
      value: parsed.data.defaultDescription,
      valueType: SettingValueType.STRING,
      group: "seo",
      description: "Deskripsi meta default website.",
    },
    {
      key: websiteSettingKeys.keywords,
      value: parsed.data.keywords,
      valueType: SettingValueType.STRING,
      group: "seo",
      description: "Kata kunci default website.",
    },
    {
      key: websiteSettingKeys.openGraphImageUrl,
      value: parsed.data.openGraphImageUrl,
      valueType: SettingValueType.URL,
      group: "seo",
      description: "Gambar default saat tautan dibagikan.",
    },
    {
      key: websiteSettingKeys.allowIndexing,
      value: parsed.data.allowIndexing,
      valueType: SettingValueType.BOOLEAN,
      group: "seo",
      description: "Izin indexing mesin pencari.",
    },
    {
      key: websiteSettingKeys.googleSiteVerification,
      value: parsed.data.googleSiteVerification,
      valueType: SettingValueType.STRING,
      group: "seo",
      description: "Kode verifikasi Google Search Console.",
    },
    {
      key: websiteSettingKeys.twitterHandle,
      value: parsed.data.twitterHandle,
      valueType: SettingValueType.STRING,
      group: "seo",
      description: "Username X/Twitter untuk metadata kartu.",
    },
    {
      key: websiteSettingKeys.heroPrimaryCtaLabel,
      value: parsed.data.heroPrimaryCtaLabel,
      valueType: SettingValueType.STRING,
      group: "home",
      description: "Label tombol utama pada hero beranda.",
    },
    {
      key: websiteSettingKeys.heroSecondaryCtaLabel,
      value: parsed.data.heroSecondaryCtaLabel,
      valueType: SettingValueType.STRING,
      group: "home",
      description: "Label tombol kedua pada hero beranda.",
    },
    {
      key: websiteSettingKeys.homeStatsStudents,
      value: parsed.data.homeStatsStudents,
      valueType: SettingValueType.NUMBER,
      group: "home",
      description: "Jumlah siswa yang ditampilkan pada beranda.",
    },
    {
      key: websiteSettingKeys.homeStatsTeachers,
      value: parsed.data.homeStatsTeachers,
      valueType: SettingValueType.NUMBER,
      group: "home",
      description: "Jumlah guru yang ditampilkan pada beranda.",
    },
    {
      key: websiteSettingKeys.homeStatsPrograms,
      value: parsed.data.homeStatsPrograms,
      valueType: SettingValueType.NUMBER,
      group: "home",
      description: "Jumlah program yang ditampilkan pada beranda.",
    },
    {
      key: websiteSettingKeys.homeStatsAchievements,
      value: parsed.data.homeStatsAchievements,
      valueType: SettingValueType.NUMBER,
      group: "home",
      description: "Jumlah prestasi yang ditampilkan pada beranda.",
    },
    {
      key: websiteSettingKeys.contactFormEnabled,
      value: parsed.data.contactFormEnabled,
      valueType: SettingValueType.BOOLEAN,
      group: "contact",
      description: "Status formulir kontak publik.",
    },
    {
      key: websiteSettingKeys.showFloatingWhatsapp,
      value: parsed.data.showFloatingWhatsapp,
      valueType: SettingValueType.BOOLEAN,
      group: "contact",
      description: "Status tombol WhatsApp mengambang.",
    },
    {
      key: websiteSettingKeys.privacyPolicyText,
      value: parsed.data.privacyPolicyText,
      valueType: SettingValueType.STRING,
      group: "privacy",
      description: "Ringkasan kebijakan privasi formulir kontak.",
    },
  ];

  try {
    await prisma.$transaction(async (transaction) => {
      const currentSettings = await transaction.websiteSetting.findMany({
        where: {
          key: {
            in: websiteSettingKeyList,
          },
        },
        select: {
          key: true,
          value: true,
          valueType: true,
          group: true,
          description: true,
          isPublic: true,
        },
      });

      const oldValue = Object.fromEntries(
        currentSettings.map((setting) => [setting.key, setting.value]),
      );

      for (const setting of settings) {
        await transaction.websiteSetting.upsert({
          where: {
            key: setting.key,
          },
          create: {
            key: setting.key,
            value: setting.value,
            valueType: setting.valueType,
            group: setting.group,
            description: setting.description,
            isPublic: true,
          },
          update: {
            value: setting.value,
            valueType: setting.valueType,
            group: setting.group,
            description: setting.description,
            isPublic: true,
          },
        });
      }

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "WEBSITE_SETTINGS_UPDATED",
          entity: "WebsiteSetting",
          entityId: "public-site",
          oldValue,
          newValue: Object.fromEntries(
            settings.map((setting) => [setting.key, setting.value]),
          ),
        },
      });
    });

    revalidateWebsiteSettingPaths();

    return {
      status: "success",
      message: "Pengaturan website berhasil disimpan.",
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui pengaturan website.", error);

    return {
      status: "error",
      message: "Pengaturan website gagal disimpan. Silakan coba kembali.",
    };
  }
}
