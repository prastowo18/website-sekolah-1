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
import { FaqFormDialog } from "@/features/faq/components/faq-form-dialog";
import { FaqTable } from "@/features/faq/components/faq-table";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "FAQ | Panel Administrasi",
  description: "Kelola pertanyaan yang sering diajukan.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
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
  status,
  page,
}: {
  q: string;
  category: string;
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

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/admin/faq?${query}` : "/admin/faq";
}

export default async function FaqPage({
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

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const categoryRecords = await prisma.faq.findMany({
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
  });

  const categoryOptions = categoryRecords
    .map((record) => record.category)
    .filter((category): category is string => Boolean(category));

  const category = categoryOptions.includes(requestedCategory)
    ? requestedCategory
    : "";

  const where: Prisma.FaqWhereInput = {};

  if (q) {
    where.OR = [
      {
        question: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        answer: {
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
    ];
  }

  if (category) {
    where.category = category;
  }

  if (status === "active") {
    where.isActive = true;
  }

  if (status === "inactive") {
    where.isActive = false;
  }

  const total = await prisma.faq.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const faqs = await prisma.faq.findMany({
    where,
    orderBy: [
      {
        category: "asc",
      },
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serialized = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    isActive: faq.isActive,
    sortOrder: faq.sortOrder,
    createdAt: faq.createdAt.toISOString(),
    updatedAt: faq.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">FAQ</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pertanyaan dan jawaban yang sering dibutuhkan pengunjung
            website.
          </p>
        </div>

        {canEdit ? <FaqFormDialog categoryOptions={categoryOptions} /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_220px_180px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari pertanyaan, jawaban, atau kategori..."
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

            {q || category || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/admin/faq">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <FaqTable
        faqs={serialized}
        categoryOptions={categoryOptions}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} FAQ.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  category,
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
