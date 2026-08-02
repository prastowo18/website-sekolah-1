import type { Metadata } from "next";
import {
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Paperclip,
  Pin,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

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
  getPublicAnnouncementList,
  type PublicAnnouncementPriority,
} from "@/features/announcement/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";
import { buildPublicShareMetadata } from "@/lib/public-share-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const shareMetadataBase: Metadata = {
    alternates: {
      canonical: "/pengumuman",
    },
    title: "Pengumuman",
    description: "Informasi dan pengumuman resmi terbaru dari sekolah.",
  };

  return buildPublicShareMetadata({
    baseMetadata: shareMetadataBase,
    pathname: "/pengumuman",
    type: "website",
  });
}

const PAGE_SIZE = 10;

const priorityLabels = {
  NORMAL: "Informasi",
  IMPORTANT: "Penting",
  URGENT: "Mendesak",
} as const;

type SearchParams = {
  q?: string | string[];
  priority?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function normalizePriority(value: string): PublicAnnouncementPriority {
  if (value === "NORMAL" || value === "IMPORTANT" || value === "URGENT") {
    return value;
  }

  return "all";
}

function formatDateTime(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function createExcerpt(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= 220) {
    return normalized;
  }

  return `${normalized.slice(0, 217).trimEnd()}...`;
}

function buildHref({
  q,
  priority,
  page,
}: {
  q: string;
  priority: PublicAnnouncementPriority;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (priority !== "all") {
    parameters.set("priority", priority);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/pengumuman?${query}` : "/pengumuman";
}

function PriorityBadge({
  priority,
}: {
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
}) {
  if (priority === "URGENT") {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="size-3.5" />
        {priorityLabels[priority]}
      </Badge>
    );
  }

  if (priority === "IMPORTANT") {
    return (
      <Badge>
        <Megaphone className="size-3.5" />
        {priorityLabels[priority]}
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      <Megaphone className="size-3.5" />
      {priorityLabels[priority]}
    </Badge>
  );
}

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const priority = normalizePriority(firstValue(parameters.priority));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const result = await getPublicAnnouncementList({
    q,
    priority,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  return (
    <main>
      <InformationPagesMotionController pageId="announcement-list" />

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <Megaphone className="size-3.5" />
              Informasi Resmi
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Pengumuman Sekolah
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Informasi resmi mengenai kegiatan, agenda, pelayanan, perubahan
              jadwal, dan pemberitahuan penting dari sekolah.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 lg:grid-cols-[1fr_230px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari judul atau isi pengumuman..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="priority" defaultValue={priority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua prioritas" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua prioritas</SelectItem>

                  <SelectItem value="NORMAL">Informasi</SelectItem>

                  <SelectItem value="IMPORTANT">Penting</SelectItem>

                  <SelectItem value="URGENT">Mendesak</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || priority !== "all" ? (
                <Button variant="outline" asChild>
                  <Link href="/pengumuman">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.announcements.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <Megaphone className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Pengumuman tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada pengumuman aktif yang sesuai dengan pencarian atau
              prioritas tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            {result.announcements.map((announcement) => {
              const attachmentUrl = getSafePublicUrl(
                announcement.attachmentUrl,
              );

              const startDate = formatDateTime(announcement.startDate);

              const endDate = formatDateTime(announcement.endDate);

              return (
                <Card
                  key={announcement.id}
                  className={
                    announcement.isPinned
                      ? "border-primary/40 bg-primary/[0.025]"
                      : undefined
                  }
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={announcement.priority} />

                      {announcement.isPinned ? (
                        <Badge variant="secondary">
                          <Pin className="size-3.5" />
                          Disematkan
                        </Badge>
                      ) : null}

                      {attachmentUrl ? (
                        <Badge variant="outline">
                          <Paperclip className="size-3.5" />
                          Lampiran
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="text-xl sm:text-2xl">
                      <Link
                        href={`/pengumuman/${announcement.slug}`}
                        className="hover:text-primary"
                      >
                        {announcement.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="leading-7 text-muted-foreground">
                      {createExcerpt(announcement.content)}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="size-4" />

                        <span>
                          {startDate
                            ? `Mulai ${startDate}`
                            : `Diterbitkan ${formatDateTime(
                                announcement.createdAt,
                              )}`}
                        </span>
                      </div>

                      {endDate ? (
                        <div className="flex items-center gap-2">
                          <span>Berlaku sampai {endDate}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href={`/pengumuman/${announcement.slug}`}>
                          Baca pengumuman
                        </Link>
                      </Button>

                      {attachmentUrl ? (
                        <Button variant="outline" asChild>
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Paperclip className="size-4" />
                            Buka lampiran
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} pengumuman.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    priority,
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
                    priority,
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
