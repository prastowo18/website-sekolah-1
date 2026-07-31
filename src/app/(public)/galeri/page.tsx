import type { Metadata } from "next";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Images,
  ImageOff,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublicGalleryAlbumList } from "@/features/gallery/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "Dokumentasi kegiatan, pembelajaran, prestasi, dan kebersamaan warga sekolah.",
};

const PAGE_SIZE = 9;

type SearchParams = {
  q?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "Tanggal kegiatan belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function buildHref({ q, page }: { q: string; page: number }): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/galeri?${query}` : "/galeri";
}

export default async function PublicGalleryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const result = await getPublicGalleryAlbumList({
    q,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <InformationPagesMotionController pageId="gallery-list" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <Images className="size-3.5" />
              Dokumentasi Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Galeri Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Dokumentasi kegiatan pembelajaran, kreativitas, prestasi, dan
              kebersamaan warga sekolah.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari judul atau deskripsi album..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q ? (
                <Button variant="outline" asChild>
                  <Link href="/galeri">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.albums.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Images className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Album tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada album yang sesuai dengan pencarian tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.albums.map((album) => {
              const firstMedia = album.media[0];

              const coverUrl =
                getSafePublicUrl(album.coverImageUrl) ??
                getSafePublicUrl(firstMedia?.thumbnailUrl) ??
                (firstMedia?.mediaType === "IMAGE"
                  ? getSafePublicUrl(firstMedia.fileUrl)
                  : null);

              return (
                <Card key={album.id} className="group overflow-hidden">
                  <Link href={`/galeri/${album.slug}`} className="block">
                    {coverUrl ? (
                      <div
                        role="img"
                        aria-label={`Album ${album.title}`}
                        className="aspect-[16/10] bg-muted bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{
                          backgroundImage: `url(${JSON.stringify(coverUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                        <ImageOff className="size-10 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                        {formatDate(album.eventDate)}
                      </div>

                      <Badge variant="secondary">
                        {album._count.media} media
                      </Badge>
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/galeri/${album.slug}`}
                        className="hover:text-primary"
                      >
                        {album.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {album.description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {album.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Lihat dokumentasi lengkap pada album ini.
                      </p>
                    )}

                    <Button variant="link" className="mt-4 h-auto p-0" asChild>
                      <Link href={`/galeri/${album.slug}`}>Buka album</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} album.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
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
