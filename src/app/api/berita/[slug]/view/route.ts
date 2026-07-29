import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  const { slug } = await context.params;
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
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
