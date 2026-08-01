import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicDocumentBySlug } from "@/features/download-document/public-queries";

type PageParams = {
  slug: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) {
    return "Tidak tersedia";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / Math.pow(1024, unitIndex);

  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value)} ${units[unitIndex]}`;
}

function getFileIcon(fileType: string | null, fileName: string): ReactNode {
  const normalized = (fileType || fileName).toLowerCase();

  if (
    normalized.includes("spreadsheet") ||
    normalized.includes("excel") ||
    normalized.endsWith(".xls") ||
    normalized.endsWith(".xlsx") ||
    normalized.endsWith(".csv")
  ) {
    return <FileSpreadsheet className="size-10" />;
  }

  if (
    normalized.includes("image") ||
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".png") ||
    normalized.endsWith(".webp")
  ) {
    return <FileImage className="size-10" />;
  }

  if (
    normalized.includes("zip") ||
    normalized.includes("archive") ||
    normalized.endsWith(".zip") ||
    normalized.endsWith(".rar")
  ) {
    return <FileArchive className="size-10" />;
  }

  if (
    normalized.includes("pdf") ||
    normalized.includes("word") ||
    normalized.includes("document") ||
    normalized.endsWith(".doc") ||
    normalized.endsWith(".docx")
  ) {
    return <FileText className="size-10" />;
  }

  return <File className="size-10" />;
}

function createDescription(value: string | null): string {
  return (
    value?.replace(/\s+/g, " ").trim().slice(0, 160) ??
    "Dokumen resmi sekolah yang dapat diunduh."
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/dokumen/${encodeURIComponent(slug)}`;
  const document = await getPublicDocumentBySlug(slug);

  if (!document) {
    return {
      title: "Dokumen Tidak Ditemukan",
    };
  }

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: document.name,
    description: createDescription(document.description),
  };
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const document = await getPublicDocumentBySlug(slug);

  if (!document) {
    notFound();
  }

  return (
    <main>
      <InformationPagesMotionController pageId="document-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/dokumen">
              <ArrowLeft className="size-4" />
              Kembali ke dokumen
            </Link>
          </Button>

          <div className="mt-8 flex flex-wrap gap-2">
            {document.category ? (
              <Badge variant="outline">{document.category}</Badge>
            ) : null}

            {document.fileType ? (
              <Badge variant="secondary">{document.fileType}</Badge>
            ) : null}
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {document.name}
          </h1>

          {document.description ? (
            <p className="mt-5 whitespace-pre-line text-lg leading-8 text-muted-foreground">
              {document.description}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {getFileIcon(document.fileType, document.fileName)}
              </div>

              <div className="min-w-0 flex-1">
                <CardTitle className="break-words text-2xl">
                  {document.fileName}
                </CardTitle>

                <p className="mt-2 text-sm text-muted-foreground">
                  Informasi file dan statistik unduhan.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <dl className="grid gap-5 rounded-xl border p-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Nama file</dt>

                <dd className="mt-1 break-all font-medium">
                  {document.fileName}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Tipe file</dt>

                <dd className="mt-1 break-all font-medium">
                  {document.fileType ?? "Tidak tersedia"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Ukuran file</dt>

                <dd className="mt-1 font-medium">
                  {formatFileSize(document.fileSizeBytes)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  Jumlah unduhan
                </dt>

                <dd className="mt-1 font-medium">
                  {document.downloadCount} kali
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Diterbitkan</dt>

                <dd className="mt-1 flex items-center gap-2 font-medium">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {formatDate(document.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  Terakhir diperbarui
                </dt>

                <dd className="mt-1 font-medium">
                  {formatDate(document.updatedAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-8 rounded-xl bg-muted/40 p-5">
              <p className="font-medium">Unduh dokumen</p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tekan tombol berikut untuk membuka atau mengunduh file. Jumlah
                unduhan akan dicatat secara otomatis.
              </p>

              <Button size="lg" className="mt-5" asChild>
                <a
                  href={`/api/dokumen/${encodeURIComponent(
                    document.slug,
                  )}/download`}
                >
                  <Download className="size-4" />
                  Unduh {document.fileName}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
