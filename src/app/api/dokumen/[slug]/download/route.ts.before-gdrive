import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function resolveFileUrl(request: NextRequest, fileUrl: string): URL | null {
  try {
    const target = fileUrl.startsWith("/")
      ? new URL(fileUrl, request.nextUrl.origin)
      : new URL(fileUrl);

    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return null;
    }

    if (
      target.origin === request.nextUrl.origin &&
      target.pathname === request.nextUrl.pathname
    ) {
      return null;
    }

    return target;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  const { slug } = await context.params;

  const document = await prisma.downloadDocument.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
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
      },
    );
  }

  const targetUrl = resolveFileUrl(request, document.fileUrl);

  if (!targetUrl) {
    return NextResponse.json(
      {
        message: "URL file dokumen tidak valid.",
      },
      {
        status: 422,
      },
    );
  }

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

  revalidatePath("/dokumen");
  revalidatePath("/konsol-8m4q7x2k9v6d/dokumen");
  revalidatePath(`/dokumen/${document.slug}`);

  return NextResponse.redirect(targetUrl, 302);
}
