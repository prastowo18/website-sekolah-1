import { NextResponse } from "next/server";

import { normalizeGoogleDriveUrl } from "@/features/download-document/google-drive-url";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

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

  return NextResponse.redirect(new URL(googleDriveUrl), 307);
}
