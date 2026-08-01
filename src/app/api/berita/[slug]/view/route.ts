import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  buildRequestFingerprint,
  consumePublicRateLimit,
  isSameOriginRequest,
} from "@/lib/public-request-security";

const routeParamsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(260)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug berita tidak valid."),
});

const VIEW_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const VIEW_RATE_LIMIT_MAX_REQUESTS = 5;

const noStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  if (!isSameOriginRequest(request)) {
    return Response.json(
      {
        message: "Permintaan tidak diizinkan.",
      },
      {
        status: 403,
        headers: noStoreHeaders,
      },
    );
  }

  const parsed = routeParamsSchema.safeParse(await context.params);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Slug berita tidak valid.",
      },
      {
        status: 400,
        headers: noStoreHeaders,
      },
    );
  }

  const { slug } = parsed.data;

  const requestFingerprint = buildRequestFingerprint(request.headers);

  const shouldIncrement = consumePublicRateLimit({
    scope: "post-view",
    key: `${requestFingerprint}:${slug}`,
    windowMs: VIEW_RATE_LIMIT_WINDOW_MS,
    maxRequests: VIEW_RATE_LIMIT_MAX_REQUESTS,
  });

  if (!shouldIncrement) {
    return new Response(null, {
      status: 204,
      headers: noStoreHeaders,
    });
  }

  const now = new Date();

  const result = await prisma.post.updateMany({
    where: {
      slug,
      status: "PUBLISHED",
      OR: [
        {
          publishedAt: null,
        },
        {
          publishedAt: {
            lte: now,
          },
        },
      ],
    },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  if (result.count === 0) {
    return Response.json(
      {
        message: "Berita tidak ditemukan.",
      },
      {
        status: 404,
        headers: noStoreHeaders,
      },
    );
  }

  return new Response(null, {
    status: 204,
    headers: noStoreHeaders,
  });
}
