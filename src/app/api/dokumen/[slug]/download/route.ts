import { NextResponse } from "next/server";
import { z } from "zod";

import { normalizeGoogleDriveUrl } from "@/features/download-document/google-drive-url";
import { prisma } from "@/lib/prisma";
import {
  buildRequestFingerprint,
  consumePublicRateLimit,
} from "@/lib/public-request-security";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

const routeParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug dokumen tidak valid."),
});

const DOWNLOAD_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DOWNLOAD_RATE_LIMIT_MAX_REQUESTS = 10;

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

export async function GET(request: Request, context: RouteContext) {
  const parsed = routeParamsSchema.safeParse(await context.params);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Slug dokumen tidak valid.",
      },
      {
        status: 400,
        headers: noStoreHeaders,
      },
    );
  }

  const { slug } = parsed.data;

  const document = await prisma.downloadDocument.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      fileUrl: true,
    },
  });

  if (!document) {
    return NextResponse.json(
      {
        message: "Dokumen tidak ditemukan atau sudah tidak aktif.",
      },
      {
        status: 404,
        headers: noStoreHeaders,
      },
    );
  }

  const googleDriveUrl = normalizeGoogleDriveUrl(document.fileUrl);

  if (!googleDriveUrl) {
    return NextResponse.json(
      {
        message: "URL Google Drive dokumen tidak valid.",
      },
      {
        status: 422,
        headers: noStoreHeaders,
      },
    );
  }

  const requestFingerprint = buildRequestFingerprint(request.headers);

  const shouldIncrement = consumePublicRateLimit({
    scope: "document-download",
    key: `${requestFingerprint}:${slug}`,
    windowMs: DOWNLOAD_RATE_LIMIT_WINDOW_MS,
    maxRequests: DOWNLOAD_RATE_LIMIT_MAX_REQUESTS,
  });

  if (shouldIncrement) {
    await prisma.downloadDocument.update({
      where: {
        id: document.id,
      },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  const response = NextResponse.redirect(new URL(googleDriveUrl), 307);

  for (const [name, value] of Object.entries(noStoreHeaders)) {
    response.headers.set(name, value);
  }

  response.headers.set("Referrer-Policy", "no-referrer");

  return response;
}
