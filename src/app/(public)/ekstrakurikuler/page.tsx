import type { Metadata } from "next";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  RotateCcw,
  Search,
  Sparkles,
  UserRound,
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
import {
  getPublicExtracurricularFilters,
  getPublicExtracurricularList,
} from "@/features/extracurricular/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Ekstrakurikuler",
  description:
    "Informasi kegiatan ekstrakurikuler untuk mengembangkan minat, bakat, kreativitas, kesehatan, dan keterampilan sosial siswa.",
};

const PAGE_SIZE = 9;

type SearchParams = {
  q?: string | string[];
  targetClass?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  q,
  targetClass,
  page,
}: {
  q: string;
  targetClass: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (targetClass) {
    parameters.set("targetClass", targetClass);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/ekstrakurikuler?${query}` : "/ekstrakurikuler";
}

export default async function ExtracurricularPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedTargetClass = firstValue(parameters.targetClass)
    .trim()
    .slice(0, 100);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const filters = await getPublicExtracurricularFilters();

  const targetClass = filters.targetClasses.includes(requestedTargetClass)
    ? requestedTargetClass
    : "";

  const result = await getPublicExtracurricularList({
    q,
    targetClass,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <CatalogPagesMotionController pageId="extracurricular-list" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <Sparkles className="size-3.5" />
              Pengembangan Minat dan Bakat
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Ekstrakurikuler
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Kegiatan ekstrakurikuler membantu siswa mengembangkan minat,
              bakat, kreativitas, kepemimpinan, kesehatan, dan kemampuan bekerja
              sama.
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
                  placeholder="Cari kegiatan, jadwal, atau pembina..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="targetClass" defaultValue={targetClass || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua kelas" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua kelas</SelectItem>

                  {filters.targetClasses.map((item) => (
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

              {q || targetClass ? (
                <Button variant="outline" asChild>
                  <Link href="/ekstrakurikuler">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.extracurriculars.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Sparkles className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Ekstrakurikuler tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada kegiatan yang sesuai dengan pencarian atau kelas sasaran
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.extracurriculars.map((activity) => {
              const imageUrl = getSafePublicUrl(activity.imageUrl);

              return (
                <Card
                  key={activity.id}
                  className="group flex h-full flex-col overflow-hidden"
                >
                  <Link
                    href={`/ekstrakurikuler/${activity.slug}`}
                    className="block overflow-hidden"
                  >
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={`Ekstrakurikuler ${activity.name}`}
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
                      {activity.targetClasses.slice(0, 3).map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}

                      {activity.targetClasses.length > 3 ? (
                        <Badge variant="secondary">
                          +{activity.targetClasses.length - 3}
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/ekstrakurikuler/${activity.slug}`}
                        className="hover:text-primary"
                      >
                        {activity.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    {activity.description ? (
                      <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                        {activity.description}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground">
                        Informasi kegiatan akan diperbarui oleh sekolah.
                      </p>
                    )}

                    <div className="mt-5 grid gap-3 text-sm">
                      {activity.schedule ? (
                        <div className="flex items-start gap-2">
                          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>{activity.schedule}</span>
                        </div>
                      ) : null}

                      {activity.coach ? (
                        <div className="flex items-start gap-2">
                          <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>Pembina: {activity.coach}</span>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="link"
                      className="mt-auto h-auto justify-start p-0 pt-6"
                      asChild
                    >
                      <Link href={`/ekstrakurikuler/${activity.slug}`}>
                        Lihat detail kegiatan
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
            Menampilkan {firstItem}–{lastItem} dari {result.total} kegiatan.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    targetClass,
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
                    targetClass,
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
