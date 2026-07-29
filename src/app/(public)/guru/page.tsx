import type { Metadata } from "next";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ImageOff,
  RotateCcw,
  Search,
  School,
  UserRound,
  UsersRound,
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
  getPublicTeacherFilters,
  getPublicTeacherList,
  type PublicTeacherRole,
} from "@/features/teacher/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Guru dan Tenaga Pendidikan",
  description:
    "Profil kepala sekolah, guru, dan tenaga pendidikan yang mendukung proses pembelajaran serta perkembangan siswa.",
};

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string | string[];
  role?: string | string[];
  subject?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeRole(value: string): PublicTeacherRole {
  if (value === "principal" || value === "teacher") {
    return value;
  }

  return "all";
}

function buildHref({
  q,
  role,
  subject,
  page,
}: {
  q: string;
  role: PublicTeacherRole;
  subject: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (role !== "all") {
    parameters.set("role", role);
  }

  if (subject) {
    parameters.set("subject", subject);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/guru?${query}` : "/guru";
}

export default async function TeacherPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const role = normalizeRole(firstValue(parameters.role));

  const requestedSubject = firstValue(parameters.subject).trim().slice(0, 120);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const filters = await getPublicTeacherFilters();

  const subject = filters.subjects.includes(requestedSubject)
    ? requestedSubject
    : "";

  const result = await getPublicTeacherList({
    q,
    role,
    subject,
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
              <UsersRound className="size-3.5" />
              Tim Pendidikan
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Guru dan Tenaga Pendidikan
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Kepala sekolah, guru, dan tenaga pendidikan yang mendampingi
              proses belajar, pembentukan karakter, serta perkembangan potensi
              siswa.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 xl:grid-cols-[1fr_220px_240px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari nama, jabatan, pelajaran, atau pendidikan..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="role" defaultValue={role}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua peran" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua peran</SelectItem>

                  <SelectItem value="principal">Kepala sekolah</SelectItem>

                  <SelectItem value="teacher">
                    Guru dan tenaga pendidikan
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select name="subject" defaultValue={subject || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua pelajaran" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua pelajaran</SelectItem>

                  {filters.subjects.map((item) => (
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

              {q || role !== "all" || subject ? (
                <Button variant="outline" asChild>
                  <Link href="/guru">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.teachers.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <UsersRound className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Data guru tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada guru yang sesuai dengan pencarian atau filter tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.teachers.map((teacher) => {
              const photoUrl = getSafePublicUrl(teacher.photoUrl);

              return (
                <Card
                  key={teacher.id}
                  className="group flex h-full flex-col overflow-hidden"
                >
                  <Link
                    href={`/guru/${teacher.slug}`}
                    className="block overflow-hidden"
                  >
                    {photoUrl ? (
                      <div
                        role="img"
                        aria-label={`Foto ${teacher.name}`}
                        className="aspect-[4/5] bg-muted bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
                        style={{
                          backgroundImage: `url(${JSON.stringify(photoUrl)})`,
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center bg-muted">
                        <ImageOff className="size-10 text-muted-foreground" />
                      </div>
                    )}
                  </Link>

                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {teacher.isPrincipal ? (
                        <Badge>
                          <School className="size-3.5" />
                          Kepala Sekolah
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <UserRound className="size-3.5" />
                          Tenaga Pendidikan
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      <Link
                        href={`/guru/${teacher.slug}`}
                        className="hover:text-primary"
                      >
                        {teacher.name}
                      </Link>
                    </CardTitle>

                    {teacher.position ? (
                      <p className="text-sm font-medium text-primary">
                        {teacher.position}
                      </p>
                    ) : null}
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col">
                    <div className="grid gap-3 text-sm">
                      {teacher.subject ? (
                        <div className="flex items-start gap-2">
                          <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>{teacher.subject}</span>
                        </div>
                      ) : null}

                      {teacher.education ? (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <GraduationCap className="mt-0.5 size-4 shrink-0" />

                          <span>{teacher.education}</span>
                        </div>
                      ) : null}
                    </div>

                    {teacher.shortBiography ? (
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {teacher.shortBiography}
                      </p>
                    ) : null}

                    <Button
                      variant="link"
                      className="mt-auto h-auto justify-start p-0 pt-6"
                      asChild
                    >
                      <Link href={`/guru/${teacher.slug}`}>Lihat profil</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} guru dan
            tenaga pendidikan.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    role,
                    subject,
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
                    subject,
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
