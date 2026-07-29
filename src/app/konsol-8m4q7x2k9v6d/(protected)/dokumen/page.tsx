import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadDocumentFormDialog } from "@/features/download-document/components/download-document-form-dialog";
import { DownloadDocumentTable } from "@/features/download-document/components/download-document-table";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dokumen | Panel Administrasi",
  description: "Kelola dokumen publik sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  fileType?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type StatusFilter = "all" | "active" | "inactive";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): StatusFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  q,
  category,
  fileType,
  status,
  page,
}: {
  q: string;
  category: string;
  fileType: string;
  status: StatusFilter;
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

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query
    ? `/konsol-8m4q7x2k9v6d/dokumen?${query}`
    : "/konsol-8m4q7x2k9v6d/dokumen";
}

export default async function DocumentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedCategory = firstValue(parameters.category)
    .trim()
    .slice(0, 100);

  const requestedFileType = firstValue(parameters.fileType).trim().slice(0, 80);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const [categoryRecords, fileTypeRecords] = await Promise.all([
    prisma.downloadDocument.findMany({
      where: {
        category: {
          not: null,
        },
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
      select: {
        category: true,
      },
    }),

    prisma.downloadDocument.findMany({
      where: {
        fileType: {
          not: null,
        },
      },
      distinct: ["fileType"],
      orderBy: {
        fileType: "asc",
      },
      select: {
        fileType: true,
      },
    }),
  ]);

  const categoryOptions = categoryRecords
    .map((record) => record.category)
    .filter((value): value is string => Boolean(value));

  const fileTypeOptions = fileTypeRecords
    .map((record) => record.fileType)
    .filter((value): value is string => Boolean(value));

  const category = categoryOptions.includes(requestedCategory)
    ? requestedCategory
    : "";

  const fileType = fileTypeOptions.includes(requestedFileType)
    ? requestedFileType
    : "";

  const where: Prisma.DownloadDocumentWhereInput = {};

  if (q) {
    where.OR = [
      {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        fileName: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        fileType: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (fileType) {
    where.fileType = fileType;
  }

  if (status === "active") {
    where.isActive = true;
  }

  if (status === "inactive") {
    where.isActive = false;
  }

  const total = await prisma.downloadDocument.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const documents = await prisma.downloadDocument.findMany({
    where,
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      fileUrl: true,
      fileName: true,
      fileSizeBytes: true,
      fileType: true,
      downloadCount: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serialized = documents.map((document) => ({
    id: document.id,
    name: document.name,
    slug: document.slug,
    description: document.description,
    category: document.category,
    fileUrl: document.fileUrl,
    fileName: document.fileName,
    fileSizeBytes: document.fileSizeBytes,
    fileType: document.fileType,
    downloadCount: document.downloadCount,
    isActive: document.isActive,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dokumen
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola dokumen unduhan, kategori, metadata file, dan jumlah unduhan.
          </p>
        </div>

        {canEdit ? (
          <DownloadDocumentFormDialog
            categoryOptions={categoryOptions}
            fileTypeOptions={fileTypeOptions}
          />
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_200px_220px_170px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari dokumen, file, kategori, atau tipe..."
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

                {categoryOptions.map((item) => (
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

                {fileTypeOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>

                <SelectItem value="active">Aktif</SelectItem>

                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || category || fileType || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/konsol-8m4q7x2k9v6d/dokumen">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <DownloadDocumentTable
        documents={serialized}
        categoryOptions={categoryOptions}
        fileTypeOptions={fileTypeOptions}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} dokumen.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  category,
                  fileType,
                  status,
                  page: currentPage - 1,
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
            Halaman {currentPage} dari {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  category,
                  fileType,
                  status,
                  page: currentPage + 1,
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
  );
}
