import type { Metadata } from "next";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ImageOff,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { CatalogPagesMotionController } from "@/components/motion/catalog-pages-motion-controller";

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
import { getPublicProgramList } from "@/features/program/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  alternates: {
    canonical: "/program",
  },
  title: "Program Pendidikan",
  description:
    "Program pendidikan reguler dan unggulan yang mendukung perkembangan akademik, karakter, kreativitas, dan keterampilan siswa.",
};

const PAGE_SIZE = 9;

type SearchParams = {
  q?: string | string[];
  featured?: string | string[];
  page?: string | string[];
};

type FeaturedFilter = "all" | "featured" | "regular";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeFeatured(value: string): FeaturedFilter {
  if (value === "featured" || value === "regular") {
    return value;
  }

  return "all";
}

function buildHref({
  q,
  featured,
  page,
}: {
  q: string;
  featured: FeaturedFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (featured !== "all") {
    parameters.set("featured", featured);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/program?${query}` : "/program";
}

export default async function PublicProgramPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const featured = normalizeFeatured(firstValue(parameters.featured));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const result = await getPublicProgramList({
    q,
    featured,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <CatalogPagesMotionController pageId="program-list" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <BookOpenCheck className="size-3.5" />
              Program Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Program Pendidikan
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Program dirancang untuk mendukung kemampuan akademik, pembentukan
              karakter, kreativitas, kesehatan, dan keterampilan sosial siswa.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 lg:grid-cols-[1fr_240px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari nama atau deskripsi program..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="featured" defaultValue={featured}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua program" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua program</SelectItem>

                  <SelectItem value="featured">Program unggulan</SelectItem>

                  <SelectItem value="regular">Program reguler</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || featured !== "all" ? (
                <Button variant="outline" asChild>
                  <Link href="/program">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.programs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <GraduationCap className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Program tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada program yang sesuai dengan pencarian atau filter
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.programs.map((program) => {
              const imageUrl = getSafePublicUrl(program.imageUrl);

              return (
                <Card
                  key={program.id}
                  className="group flex h-full flex-col overflow-hidden"
                >
                  <Link
                    href={`/program/${program.slug}`}
                    className="block overflow-hidden"
                  >
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={`Program ${program.name}`}
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
                    <div className="flex flex-wrap gap-2">
                      {program.isFeatured ? (
                        <Badge>
                          <Sparkles className="size-3.5" />
                          Program Unggulan
                        </Badge>
                      ) : (
                        <Badge variant="outline">Program Pendidikan</Badge>
                      )}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/program/${program.slug}`}
                        className="hover:text-primary"
                      >
                        {program.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {program.shortDescription ??
                        program.description ??
                        "Informasi program akan diperbarui oleh sekolah."}
                    </p>

                    {program.benefits.length > 0 ? (
                      <div className="mt-5 grid gap-2">
                        {program.benefits.slice(0, 3).map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span className="line-clamp-2">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <Button
                      variant="link"
                      className="mt-auto h-auto justify-start p-0 pt-6"
                      asChild
                    >
                      <Link href={`/program/${program.slug}`}>
                        Lihat detail program
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
            Menampilkan {firstItem}–{lastItem} dari {result.total} program.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    featured,
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
                    featured,
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
