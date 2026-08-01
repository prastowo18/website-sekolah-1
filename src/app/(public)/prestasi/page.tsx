import type { Metadata } from "next";
import {
  Award,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Medal,
  RotateCcw,
  Search,
  Trophy,
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
  getPublicAchievementList,
  type PublicAchievementType,
  type PublicCompetitionLevel,
} from "@/features/achievement/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  alternates: {
    canonical: "/prestasi",
  },
  title: "Prestasi Sekolah",
  description:
    "Prestasi siswa, guru, dan sekolah dalam berbagai bidang serta tingkat kompetisi.",
};

const PAGE_SIZE = 9;

const achievementTypeLabels = {
  STUDENT: "Prestasi Siswa",
  TEACHER: "Prestasi Guru",
  SCHOOL: "Prestasi Sekolah",
} as const;

const competitionLevelLabels = {
  SCHOOL: "Sekolah",
  DISTRICT: "Kecamatan",
  CITY: "Kabupaten/Kota",
  PROVINCE: "Provinsi",
  NATIONAL: "Nasional",
  INTERNATIONAL: "Internasional",
} as const;

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
  level?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeType(value: string): PublicAchievementType {
  if (value === "STUDENT" || value === "TEACHER" || value === "SCHOOL") {
    return value;
  }

  return "all";
}

function normalizeLevel(value: string): PublicCompetitionLevel {
  if (
    value === "SCHOOL" ||
    value === "DISTRICT" ||
    value === "CITY" ||
    value === "PROVINCE" ||
    value === "NATIONAL" ||
    value === "INTERNATIONAL"
  ) {
    return value;
  }

  return "all";
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "Tanggal belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function buildHref({
  q,
  achievementType,
  competitionLevel,
  page,
}: {
  q: string;
  achievementType: PublicAchievementType;
  competitionLevel: PublicCompetitionLevel;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (achievementType !== "all") {
    parameters.set("type", achievementType);
  }

  if (competitionLevel !== "all") {
    parameters.set("level", competitionLevel);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/prestasi?${query}` : "/prestasi";
}

export default async function AchievementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const achievementType = normalizeType(firstValue(parameters.type));

  const competitionLevel = normalizeLevel(firstValue(parameters.level));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const result = await getPublicAchievementList({
    q,
    achievementType,
    competitionLevel,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <CatalogPagesMotionController pageId="achievement-list" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <Trophy className="size-3.5" />
              Pencapaian Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Prestasi Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Pencapaian siswa, guru, dan sekolah merupakan hasil proses
              belajar, pembinaan, kerja sama, dan kedisiplinan seluruh warga
              sekolah.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari judul, penerima, kategori, atau peringkat..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="type" defaultValue={achievementType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua jenis" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua jenis</SelectItem>

                  <SelectItem value="STUDENT">Prestasi siswa</SelectItem>

                  <SelectItem value="TEACHER">Prestasi guru</SelectItem>

                  <SelectItem value="SCHOOL">Prestasi sekolah</SelectItem>
                </SelectContent>
              </Select>

              <Select name="level" defaultValue={competitionLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua tingkat" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua tingkat</SelectItem>

                  {Object.entries(competitionLevelLabels).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || achievementType !== "all" || competitionLevel !== "all" ? (
                <Button variant="outline" asChild>
                  <Link href="/prestasi">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.achievements.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Trophy className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Prestasi tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada prestasi yang sesuai dengan pencarian atau filter
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.achievements.map((achievement) => {
              const imageUrl = getSafePublicUrl(achievement.imageUrl);

              return (
                <Card
                  key={achievement.id}
                  className="group flex h-full flex-col overflow-hidden"
                >
                  <Link
                    href={`/prestasi/${achievement.slug}`}
                    className="block overflow-hidden"
                  >
                    {imageUrl ? (
                      <div
                        role="img"
                        aria-label={achievement.title}
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
                      <Badge>
                        <Award className="size-3.5" />
                        {achievementTypeLabels[achievement.achievementType]}
                      </Badge>

                      {achievement.competitionLevel ? (
                        <Badge variant="outline">
                          {competitionLevelLabels[achievement.competitionLevel]}
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/prestasi/${achievement.slug}`}
                        className="hover:text-primary"
                      >
                        {achievement.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <div className="grid gap-3 text-sm">
                      {achievement.winnerName ? (
                        <div className="flex items-start gap-2">
                          <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>{achievement.winnerName}</span>
                        </div>
                      ) : null}

                      {achievement.rank ? (
                        <div className="flex items-start gap-2">
                          <Medal className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>{achievement.rank}</span>
                        </div>
                      ) : null}

                      <div className="flex items-start gap-2 text-muted-foreground">
                        <CalendarDays className="mt-0.5 size-4 shrink-0" />

                        <span>{formatDate(achievement.achievementDate)}</span>
                      </div>
                    </div>

                    {achievement.description ? (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {achievement.description}
                      </p>
                    ) : null}

                    <Button
                      variant="link"
                      className="mt-auto h-auto justify-start p-0 pt-6"
                      asChild
                    >
                      <Link href={`/prestasi/${achievement.slug}`}>
                        Lihat detail prestasi
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
            Menampilkan {firstItem}–{lastItem} dari {result.total} prestasi.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    achievementType,
                    competitionLevel,
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
                    achievementType,
                    competitionLevel,
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
