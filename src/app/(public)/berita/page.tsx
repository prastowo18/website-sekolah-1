import type { Metadata } from "next";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  Newspaper,
  RotateCcw,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
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
import {
  getPublicPostCategories,
  getPublicPostList,
} from "@/features/post/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Berita",
  description:
    "Berita, kegiatan, pengumuman, dan informasi terbaru dari sekolah.",
};

const PAGE_SIZE = 9;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
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

function buildHref({
  q,
  category,
  page,
}: {
  q: string;
  category: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (category) {
    parameters.set("category", category);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/berita?${query}` : "/berita";
}

export default async function PublicPostPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedCategory = firstValue(parameters.category)
    .trim()
    .slice(0, 140);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const categories = await getPublicPostCategories();

  const category = categories.some((item) => item.slug === requestedCategory)
    ? requestedCategory
    : "";

  const result = await getPublicPostList({
    q,
    categorySlug: category,
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
              <Newspaper className="size-3.5" />
              Pusat Informasi
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Berita Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Ikuti kegiatan pembelajaran, pencapaian, agenda, dan informasi
              terbaru dari lingkungan sekolah.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 lg:grid-cols-[1fr_260px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari judul atau isi ringkas berita..."
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

                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.slug}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || category ? (
                <Button variant="outline" asChild>
                  <Link href="/berita">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.posts.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Newspaper className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Berita tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada berita yang sesuai dengan pencarian atau kategori
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.posts.map((post) => {
              const imageUrl = getSafePublicUrl(post.featuredImageUrl);

              return (
                <Card key={post.id} className="group overflow-hidden">
                  <Link href={`/berita/${post.slug}`} className="block">
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={post.title}
                        className="aspect-[16/10] bg-muted bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{
                          backgroundImage: `url(${JSON.stringify(imageUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                        <ImageOff className="size-10 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      {post.category ? (
                        <Badge variant="outline">{post.category.name}</Badge>
                      ) : null}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </div>
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/berita/${post.slug}`}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {post.excerpt ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Baca informasi selengkapnya pada halaman berita.
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UserRound className="size-3.5" />
                        {post.author?.name ?? "Admin Sekolah"}
                      </div>

                      <div className="flex items-center gap-1">
                        <Eye className="size-3.5" />
                        {post.viewCount} tayangan
                      </div>
                    </div>

                    <Button variant="link" className="mt-4 h-auto p-0" asChild>
                      <Link href={`/berita/${post.slug}`}>
                        Baca selengkapnya
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} berita.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    category,
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
