import type { Metadata } from "next";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  Quote,
  RotateCcw,
  Search,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { ContentListPagesMotionController } from "@/components/motion/content-list-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPublicTestimonialList,
  getPublicTestimonialRoles,
} from "@/features/testimonial/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  alternates: {
    canonical: "/testimoni",
  },
  title: "Testimoni",
  description:
    "Pengalaman dan pandangan orang tua, alumni, siswa, serta masyarakat mengenai sekolah.",
};

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string | string[];
  role?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "T";
}

function buildHref({
  q,
  role,
  page,
}: {
  q: string;
  role: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (role) {
    parameters.set("role", role);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/testimoni?${query}` : "/testimoni";
}

export default async function TestimonialPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedRole = firstValue(parameters.role).trim().slice(0, 120);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const roles = await getPublicTestimonialRoles();

  const role = roles.includes(requestedRole) ? requestedRole : "";

  const result = await getPublicTestimonialList({
    q,
    role,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <ContentListPagesMotionController pageId="testimonial" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <MessageCircleMore className="size-3.5" />
              Cerita dari Warga Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Testimoni
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Pengalaman dan pandangan orang tua, alumni, siswa, serta
              masyarakat mengenai pembelajaran, pelayanan, lingkungan, dan
              kegiatan sekolah.
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
                  placeholder="Cari nama, peran, atau isi testimoni..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="role" defaultValue={role || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua peran" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua peran</SelectItem>

                  {roles.map((item) => (
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

              {q || role ? (
                <Button variant="outline" asChild>
                  <Link href="/testimoni">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.testimonials.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <MessageCircleMore className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Testimoni tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada testimoni terpublikasi yang sesuai dengan pencarian atau
              peran tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {result.testimonials.map((testimonial) => {
              const photoUrl = getSafePublicUrl(testimonial.photoUrl);

              return (
                <Card key={testimonial.id} className="relative overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute right-5 top-5 text-primary/10"
                  >
                    <Quote className="size-16" />
                  </div>

                  <CardHeader className="relative flex-row items-center gap-4 space-y-0">
                    {photoUrl ? (
                      <div
                        role="img"
                        aria-label={`Foto ${testimonial.name}`}
                        className="size-16 shrink-0 rounded-full border bg-muted bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${JSON.stringify(photoUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {getInitials(testimonial.name)}
                      </div>
                    )}

                    <div className="min-w-0 pr-10">
                      <h2 className="truncate text-lg font-semibold">
                        {testimonial.name}
                      </h2>

                      {testimonial.role ? (
                        <Badge variant="outline" className="mt-2 max-w-full">
                          <span className="truncate">{testimonial.role}</span>
                        </Badge>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Warga sekolah
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    <Quote className="mb-4 size-6 text-primary" />

                    <blockquote className="whitespace-pre-line break-words leading-7 text-foreground/85">
                      {testimonial.content}
                    </blockquote>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} testimoni.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    role,
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
                    role,
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

        <Card className="mt-12 border-primary/30 bg-primary/[0.025]">
          <CardContent className="flex flex-col items-start justify-between gap-6 pt-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <UsersRound className="size-5" />

                <p className="text-sm font-semibold uppercase tracking-[0.15em]">
                  Mengenal Sekolah
                </p>
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Pelajari lingkungan dan program sekolah
              </h2>

              <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                Lihat profil, program pendidikan, fasilitas, dan informasi PPDB
                melalui halaman resmi sekolah.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/profil">Profil Sekolah</Link>
              </Button>

              <Button asChild>
                <Link href="/ppdb">Informasi PPDB</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
