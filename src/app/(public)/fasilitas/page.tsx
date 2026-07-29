import type { Metadata } from "next";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublicFacilityList } from "@/features/facility/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Fasilitas Sekolah",
  description:
    "Informasi ruang belajar, sarana pendukung, dan fasilitas yang tersedia di sekolah.",
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

function buildHref({ q, page }: { q: string; page: number }): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/fasilitas?${query}` : "/fasilitas";
}

function formatCapacity(capacity: string | null): string {
  const normalized = capacity?.trim();

  return normalized || "Belum ditentukan";
}

export default async function PublicFacilityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const result = await getPublicFacilityList({
    q,
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
              <Building2 className="size-3.5" />
              Sarana Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Fasilitas Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Sarana dan lingkungan sekolah dirancang untuk mendukung kegiatan
              belajar, kreativitas, kesehatan, keamanan, dan kenyamanan siswa.
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
                  placeholder="Cari nama atau deskripsi fasilitas..."
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
                  <Link href="/fasilitas">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.facilities.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Building2 className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Fasilitas tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada fasilitas yang sesuai dengan pencarian tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.facilities.map((facility) => {
              const imageUrl = getSafePublicUrl(facility.imageUrl);

              return (
                <Card
                  key={facility.id}
                  className="group flex h-full flex-col overflow-hidden"
                >
                  <Link
                    href={`/fasilitas/${facility.slug}`}
                    className="block overflow-hidden"
                  >
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={`Fasilitas ${facility.name}`}
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
                      {facility.condition ? (
                        <Badge variant="secondary">
                          <ShieldCheck className="size-3.5" />
                          {facility.condition}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Fasilitas Sekolah</Badge>
                      )}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/fasilitas/${facility.slug}`}
                        className="hover:text-primary"
                      >
                        {facility.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    {facility.description ? (
                      <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                        {facility.description}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground">
                        Informasi fasilitas akan diperbarui oleh sekolah.
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 shrink-0 text-primary" />
                      {formatCapacity(facility.capacity)}
                    </div>

                    <Button
                      variant="link"
                      className="mt-auto h-auto justify-start p-0 pt-6"
                      asChild
                    >
                      <Link href={`/fasilitas/${facility.slug}`}>
                        Lihat detail fasilitas
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
            Menampilkan {firstItem}–{lastItem} dari {result.total} fasilitas.
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
