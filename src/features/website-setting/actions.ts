"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { SettingValueType, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { websiteSettingKeys } from "./constants";
import { websiteSettingSchema } from "./schemas";
import type {
  WebsiteSettingActionState,
  WebsiteSettingFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN] as const;

function getFormValues(formData: FormData) {
  return {
    defaultTitle: formData.get("defaultTitle") ?? "",

    defaultDescription: formData.get("defaultDescription") ?? "",

    keywords: formData.get("keywords") ?? "",

    openGraphImageUrl: formData.get("openGraphImageUrl") ?? "",

    allowIndexing: formData.get("allowIndexing") ?? "",

    googleSiteVerification: formData.get("googleSiteVerification") ?? "",

    twitterHandle: formData.get("twitterHandle") ?? "",
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

  const settings = [
    {
      key: websiteSettingKeys.defaultTitle,
      value: parsed.data.defaultTitle,
      valueType: SettingValueType.STRING,
      description: "Judul SEO default website.",
    },
    {
      key: websiteSettingKeys.defaultDescription,
      value: parsed.data.defaultDescription,
      valueType: SettingValueType.STRING,
      description: "Deskripsi meta default website.",
    },
    {
      key: websiteSettingKeys.keywords,
      value: parsed.data.keywords,
      valueType: SettingValueType.STRING,
      description: "Kata kunci default website.",
    },
    {
      key: websiteSettingKeys.openGraphImageUrl,
      value: parsed.data.openGraphImageUrl,
      valueType: SettingValueType.URL,
      description: "Gambar Open Graph default.",
    },
    {
      key: websiteSettingKeys.allowIndexing,
      value: parsed.data.allowIndexing,
      valueType: SettingValueType.BOOLEAN,
      description: "Status izin indexing mesin pencari.",
    },
    {
      key: websiteSettingKeys.googleSiteVerification,
      value: parsed.data.googleSiteVerification,
      valueType: SettingValueType.STRING,
      description: "Kode Google Site Verification.",
    },
    {
      key: websiteSettingKeys.twitterHandle,
      value: parsed.data.twitterHandle,
      valueType: SettingValueType.STRING,
      description: "Username X atau Twitter resmi.",
    },
  ] as const;

  try {
    await prisma.$transaction(async (transaction) => {
      const currentSettings = await transaction.websiteSetting.findMany({
        where: {
          key: {
            in: settings.map((setting) => setting.key),
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
        currentSettings.map((setting) => [
          setting.key,
          {
            value: setting.value,
            valueType: setting.valueType,
            group: setting.group,
            description: setting.description,
            isPublic: setting.isPublic,
          },
        ]),
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
            group: "seo",
            description: setting.description,
            isPublic: true,
          },
          update: {
            value: setting.value,
            valueType: setting.valueType,
            group: "seo",
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
          entityId: "seo",
          oldValue,
          newValue: parsed.data,
        },
      });
    });

    revalidateWebsiteSettingPaths();

    return {
      status: "success",
      message: "Pengaturan website berhasil disimpan.",
    };
  } catch (error: unknown) {
    console.error("Gagal menyimpan pengaturan website.", error);

    return {
      status: "error",
      message: "Pengaturan website gagal disimpan. Silakan coba kembali.",
    };
  }
}
