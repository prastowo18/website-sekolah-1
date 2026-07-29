import type { Metadata } from "next";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  RotateCcw,
  Search,
} from "lucide-react";
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
import { PostFormDialog } from "@/features/post/components/post-form-dialog";
import { PostTable } from "@/features/post/components/post-table";
import {
  postStatusLabels,
  postStatuses,
  type PostStatusValue,
} from "@/features/post/constants";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Berita | Panel Administrasi",
  description: "Kelola berita dan publikasi sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  category?: string | string[];
  page?: string | string[];
};

type StatusFilter = "all" | PostStatusValue;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): StatusFilter {
  return postStatuses.includes(value as PostStatusValue)
    ? (value as PostStatusValue)
    : "all";
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  q,
  status,
  category,
  page,
}: {
  q: string;
  status: StatusFilter;
  category: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (category) {
    parameters.set("category", category);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query
    ? `/konsol-8m4q7x2k9v6d/berita?${query}`
    : "/konsol-8m4q7x2k9v6d/berita";
}

export default async function PostPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedCategory = firstValue(parameters.category).trim();

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const categoryOptions = await prisma.postCategory.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  const category = categoryOptions.some((item) => item.id === requestedCategory)
    ? requestedCategory
    : "";

  const where: Prisma.PostWhereInput = {};

  if (q) {
    where.OR = [
      {
        title: {
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
        excerpt: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        seoTitle: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (status !== "all") {
    where.status = status;
  }

  if (category) {
    where.categoryId = category;
  }

  const total = await prisma.post.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const posts = await prisma.post.findMany({
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
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImageUrl: true,
      status: true,
      publishedAt: true,
      scheduledAt: true,
      categoryId: true,
      viewCount: true,
      seoTitle: true,
      seoDescription: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  const serialized = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featuredImageUrl: post.featuredImageUrl,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    categoryId: post.categoryId,
    categoryName: post.category?.name ?? null,
    viewCount: post.viewCount,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Berita
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola draft, jadwal publikasi, berita terbit, dan arsip.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/konsol-8m4q7x2k9v6d/kategori-berita">
              <FolderOpen className="size-4" />
              Kategori
            </Link>
          </Button>

          {canEdit ? <PostFormDialog categories={categoryOptions} /> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_180px_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, isi, ringkasan, atau slug..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>

                {postStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {postStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="category" defaultValue={category || "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>

                {categoryOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || status !== "all" || category ? (
              <Button variant="outline" asChild>
                <Link href="/konsol-8m4q7x2k9v6d/berita">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <PostTable
        posts={serialized}
        categories={categoryOptions}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} berita.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  status,
                  category,
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
                  status,
                  category,
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
