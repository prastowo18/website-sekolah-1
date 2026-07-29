import type { Metadata } from "next";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Files,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPublicDocumentFilters,
  getPublicDocumentList,
} from "@/features/download-document/public-queries";

export const metadata: Metadata = {
  title: "Dokumen",
  description:
    "Unduh dokumen, formulir, kalender, panduan, dan informasi resmi sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  fileType?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) {
    return "Ukuran tidak tersedia";
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
    return <FileSpreadsheet className="size-7" />;
  }

  if (
    normalized.includes("image") ||
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".png") ||
    normalized.endsWith(".webp")
  ) {
    return <FileImage className="size-7" />;
  }

  if (
    normalized.includes("zip") ||
    normalized.includes("archive") ||
    normalized.endsWith(".zip") ||
    normalized.endsWith(".rar")
  ) {
    return <FileArchive className="size-7" />;
  }

  if (
    normalized.includes("pdf") ||
    normalized.includes("word") ||
    normalized.includes("document") ||
    normalized.endsWith(".doc") ||
    normalized.endsWith(".docx")
  ) {
    return <FileText className="size-7" />;
  }

  return <File className="size-7" />;
}

function getFileTypeLabel(fileType: string | null, fileName: string): string {
  const extension = fileName.split(".").pop()?.trim().toUpperCase();

  if (extension && extension !== fileName.toUpperCase()) {
    return extension;
  }

  return fileType ?? "File";
}

function buildHref({
  q,
  category,
  fileType,
  page,
}: {
  q: string;
  category: string;
  fileType: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (category) {
    parameters.set("category", category);
  }

  if (fileType) {
    parameters.set("fileType", fileType);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/dokumen?${query}` : "/dokumen";
}

export default async function PublicDocumentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedCategory = firstValue(parameters.category)
    .trim()
    .slice(0, 100);

  const requestedFileType = firstValue(parameters.fileType).trim().slice(0, 80);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const filters = await getPublicDocumentFilters();

  const category = filters.categories.includes(requestedCategory)
    ? requestedCategory
    : "";

  const fileType = filters.fileTypes.includes(requestedFileType)
    ? requestedFileType
    : "";

  const result = await getPublicDocumentList({
    q,
    category,
    fileType,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <Files className="size-3.5" />
              Pusat Unduhan
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Dokumen Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Unduh dokumen, panduan, kalender, formulir, dan informasi resmi
              yang diterbitkan sekolah.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 xl:grid-cols-[1fr_220px_250px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari nama, kategori, atau nama file..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="category" defaultValue={category || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>

                  {filters.categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select name="fileType" defaultValue={fileType || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua tipe file" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua tipe file</SelectItem>

                  {filters.fileTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || category || fileType ? (
                <Button variant="outline" asChild>
                  <Link href="/dokumen">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.documents.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Files className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Dokumen tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada dokumen yang sesuai dengan pencarian atau filter
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {result.documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="flex h-full flex-col pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {getFileIcon(document.fileType, document.fileName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {document.category ? (
                          <Badge variant="outline">{document.category}</Badge>
                        ) : null}

                        <Badge variant="secondary">
                          {getFileTypeLabel(
                            document.fileType,
                            document.fileName,
                          )}
                        </Badge>
                      </div>

                      <CardTitle className="mt-3 text-xl">
                        <Link
                          href={`/dokumen/${document.slug}`}
                          className="hover:text-primary"
                        >
                          {document.name}
                        </Link>
                      </CardTitle>
                    </div>
                  </div>

                  {document.description ? (
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {document.description}
                    </p>
                  ) : (
                    <p className="mt-5 text-sm text-muted-foreground">
                      Dokumen resmi sekolah yang dapat diunduh.
                    </p>
                  )}

                  <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <p className="break-all">{document.fileName}</p>

                    <p>{formatFileSize(document.fileSizeBytes)}</p>

                    <p>Diterbitkan {formatDate(document.createdAt)}</p>

                    <p className="flex items-center gap-1">
                      <Download className="size-3.5" />
                      {document.downloadCount} unduhan
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-6">
                    <Button variant="outline" asChild>
                      <Link href={`/dokumen/${document.slug}`}>
                        <Eye className="size-4" />
                        Detail
                      </Link>
                    </Button>

                    <Button asChild>
                      <a
                        href={`/api/dokumen/${encodeURIComponent(
                          document.slug,
                        )}/download`}
                      >
                        <Download className="size-4" />
                        Unduh
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} dokumen.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    category,
                    fileType,
                    page: result.currentPage - 1,
                  })}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
            )}

            <span className="min-w-24 text-center">
              Halaman {result.currentPage} dari {result.totalPages}
            </span>

            {result.currentPage < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    category,
                    fileType,
                    page: result.currentPage + 1,
                  })}
                >
                  Berikutnya
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Berikutnya
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
