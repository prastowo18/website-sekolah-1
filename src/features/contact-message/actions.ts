"use server";

import { getPublicWebsiteSettingsUncached } from "@/features/website-setting/queries";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { ContactMessageStatus, type Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildRequestFingerprint,
  consumePublicRateLimit,
} from "@/lib/public-request-security";

import { publicContactMessageSchema } from "./schemas";
import type { ContactMessageActionState } from "./types";

const RATE_LIMIT_DURATION_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const MINIMUM_FORM_COMPLETION_MS = 3 * 1000;
const MAXIMUM_FORM_AGE_MS = 24 * 60 * 60 * 1000;

function countUrls(value: string): number {
  const matches = value.match(/(?:https?:\/\/|www\.)/gi);

  return matches?.length ?? 0;
}

function containsRepeatedCharacters(value: string): boolean {
  return /(.)\1{14,}/i.test(value);
}

function parseStartedAt(value: string): number | null {
  if (!value) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    if (numericValue >= 1_000_000_000_000) {
      return numericValue;
    }

    if (numericValue >= 1_000_000_000) {
      return numericValue * 1000;
    }
  }

  const parsedDate = Date.parse(value);

  return Number.isFinite(parsedDate) ? parsedDate : null;
}

function hasSuspiciousCompletionTime(startedAt: string): boolean {
  if (!startedAt) {
    return false;
  }

  const parsedStartedAt = parseStartedAt(startedAt);

  if (parsedStartedAt === null) {
    return true;
  }

  const elapsed = Date.now() - parsedStartedAt;

  return elapsed < MINIMUM_FORM_COMPLETION_MS || elapsed > MAXIMUM_FORM_AGE_MS;
}

export async function submitContactMessageAction(
  _previousState: ContactMessageActionState,
  formData: FormData,
): Promise<ContactMessageActionState> {
  const websiteSettings = await getPublicWebsiteSettingsUncached();

  if (!websiteSettings.contactFormEnabled) {
    return {
      status: "error",
      message: "Formulir kontak sedang dinonaktifkan.",
    };
  }

  const parsed = publicContactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website"),
    startedAt: formData.get("startedAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali data formulir kontak.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >,
    };
  }

  const requestHeaders = await headers();
  const requestFingerprint = buildRequestFingerprint(requestHeaders);

  if (
    !consumePublicRateLimit({
      scope: "contact-message",
      key: requestFingerprint,
      windowMs: RATE_LIMIT_DURATION_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    })
  ) {
    return {
      status: "error",
      message:
        "Terlalu banyak pesan dikirim. Silakan coba kembali beberapa saat lagi.",
    };
  }

  const { name, email, phone, subject, message, website, startedAt } =
    parsed.data;

  const isSpam =
    Boolean(website) ||
    countUrls(message) > 3 ||
    containsRepeatedCharacters(message) ||
    hasSuspiciousCompletionTime(startedAt);

  try {
    const identityFilters: Prisma.ContactMessageWhereInput[] = [];

    if (email) {
      identityFilters.push({
        email,
      });
    }

    if (phone) {
      identityFilters.push({
        phone,
      });
    }

    const recentIdentityCount = await prisma.contactMessage.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - RATE_LIMIT_DURATION_MS),
        },
        OR: identityFilters,
      },
    });

    if (recentIdentityCount >= RATE_LIMIT_MAX_REQUESTS) {
      return {
        status: "error",
        message:
          "Terlalu banyak pesan dikirim. Silakan coba kembali beberapa saat lagi.",
      };
    }

    const createdMessage = await prisma.contactMessage.create({
      data: {
        name,
        email: email ?? null,
        phone: phone ?? null,
        subject: subject ?? null,
        message,
        status: isSpam ? ContactMessageStatus.SPAM : ContactMessageStatus.NEW,
        sourcePage: "/kontak",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.info("Contact message saved:", {
        id: createdMessage.id,
        status: createdMessage.status,
        createdAt: createdMessage.createdAt,
      });
    }

    revalidatePath("/konsol-8m4q7x2k9v6d/pesan-kontak");
    revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");

    return {
      status: "success",
      message:
        "Pesan berhasil dikirim. Pihak sekolah akan menindaklanjuti pesan Anda.",
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Create contact message failed:", error);
    } else {
      console.error("Create contact message failed.");
    }

    return {
      status: "error",
      message: "Pesan belum dapat disimpan. Silakan coba kembali.",
    };
  }
}
