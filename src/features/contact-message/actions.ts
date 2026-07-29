"use server";

import {
  ContactMessageStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  publicContactMessageSchema,
} from "./schemas";
import type {
  ContactMessageActionState,
} from "./types";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_DURATION_MS =
  15 * 60 * 1000;

const RATE_LIMIT_MAX_REQUESTS = 5;

const globalForContactMessage =
  globalThis as unknown as {
    contactMessageRateLimits?: Map<
      string,
      RateLimitEntry
    >;
  };

const rateLimitStore =
  globalForContactMessage
    .contactMessageRateLimits ??
  new Map<string, RateLimitEntry>();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForContactMessage.contactMessageRateLimits =
    rateLimitStore;
}

function consumeRateLimit(
  key: string,
): boolean {
  const now = Date.now();
  const current =
    rateLimitStore.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt:
        now +
        RATE_LIMIT_DURATION_MS,
    });

    return true;
  }

  if (
    current.count >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return false;
  }

  current.count += 1;

  rateLimitStore.set(
    key,
    current,
  );

  return true;
}

function countUrls(
  value: string,
): number {
  const matches = value.match(
    /(?:https?:\/\/|www\.)/gi,
  );

  return matches?.length ?? 0;
}

function containsRepeatedCharacters(
  value: string,
): boolean {
  return /(.)\1{14,}/i.test(
    value,
  );
}

function buildRateLimitKey({
  forwardedFor,
  realIp,
  userAgent,
}: {
  forwardedFor: string | null;
  realIp: string | null;
  userAgent: string | null;
}): string {
  const clientIp =
    forwardedFor
      ?.split(",")[0]
      ?.trim() ||
    realIp?.trim() ||
    "unknown";

  return `${clientIp}:${userAgent ?? "unknown"}`.slice(
    0,
    500,
  );
}

export async function submitContactMessageAction(
  _previousState: ContactMessageActionState,
  formData: FormData,
): Promise<ContactMessageActionState> {
  const parsed =
    publicContactMessageSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject:
        formData.get("subject"),
      message:
        formData.get("message"),
      website:
        formData.get("website"),
      startedAt:
        formData.get("startedAt"),
    });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        "Periksa kembali data formulir kontak.",
      fieldErrors:
        parsed.error.flatten()
          .fieldErrors as Record<
          string,
          string[] | undefined
        >,
    };
  }

  const requestHeaders =
    await headers();

  const rateLimitKey =
    buildRateLimitKey({
      forwardedFor:
        requestHeaders.get(
          "x-forwarded-for",
        ),

      realIp:
        requestHeaders.get(
          "x-real-ip",
        ),

      userAgent:
        requestHeaders.get(
          "user-agent",
        ),
    });

  if (
    !consumeRateLimit(
      rateLimitKey,
    )
  ) {
    return {
      status: "error",
      message:
        "Terlalu banyak pesan dikirim. Silakan coba kembali beberapa saat lagi.",
    };
  }

  const {
    name,
    email,
    phone,
    subject,
    message,
    website,
  } = parsed.data;

  const isSpam =
    Boolean(website) ||
    countUrls(message) > 3 ||
    containsRepeatedCharacters(
      message,
    );

  try {
    const createdMessage =
      await prisma.contactMessage.create({
        data: {
          name,
          email: email ?? null,
          phone: phone ?? null,
          subject:
            subject ?? null,
          message,

          status: isSpam
            ? ContactMessageStatus.SPAM
            : ContactMessageStatus.NEW,

          sourcePage: "/kontak",
        },

        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });

    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      console.info(
        "Contact message saved:",
        {
          id: createdMessage.id,
          status:
            createdMessage.status,
          createdAt:
            createdMessage.createdAt,
        },
      );
    }

    revalidatePath(
      "/admin/pesan-kontak",
    );

    revalidatePath(
      "/admin/dashboard",
    );

    return {
      status: "success",
      message:
        "Pesan berhasil dikirim. Pihak sekolah akan menindaklanjuti pesan Anda.",
    };
  } catch (error) {
    console.error(
      "Create contact message failed:",
      error,
    );

    return {
      status: "error",
      message:
        "Pesan belum dapat disimpan. Silakan coba kembali.",
    };
  }
}
