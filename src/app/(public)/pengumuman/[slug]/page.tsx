import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarRange,
  Megaphone,
  Paperclip,
  Pin,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicAnnouncementBySlug,
  getRelatedPublicAnnouncements,
} from "@/features/announcement/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";
import { buildPublicShareMetadata } from "@/lib/public-share-metadata";

type PageParams = {
  slug: string;
};

const priorityLabels = {
  NORMAL: "Informasi",
  IMPORTANT: "Penting",
  URGENT: "Mendesak",
} as const;

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

function createDescription(content: string): string {
  return content.replace(/\s+/g, " ").trim().slice(0, 160);
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

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/pengumuman/${encodeURIComponent(slug)}`;

  const announcement = await getPublicAnnouncementBySlug(slug);

  if (!announcement) {
    return {
      title: "Pengumuman Tidak Ditemukan",
    };
  }

  const shareMetadataBase: Metadata = {
    alternates: {
      canonical: canonicalPath,
    },
    title: announcement.title,
    description: createDescription(announcement.content),
  };

  return buildPublicShareMetadata({
    baseMetadata: shareMetadataBase,
    pathname: `/pengumuman/${encodeURIComponent(slug)}`,
    imageAlt: announcement.title,
    type: "article",
  });
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const announcement = await getPublicAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  const relatedAnnouncements = await getRelatedPublicAnnouncements({
    announcementId: announcement.id,
    priority: announcement.priority,
  });

  const attachmentUrl = getSafePublicUrl(announcement.attachmentUrl);

  const startDate = formatDateTime(announcement.startDate);

  const endDate = formatDateTime(announcement.endDate);

  return (
    <main>
      <InformationPagesMotionController pageId="announcement-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/pengumuman">
              <ArrowLeft className="size-4" />
              Kembali ke pengumuman
            </Link>
          </Button>

          <div className="mt-8 flex flex-wrap gap-2">
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
                Memiliki lampiran
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {announcement.title}
          </h1>

          <div className="mt-7 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <CalendarRange className="mt-0.5 size-4 shrink-0" />

              <span>
                {startDate
                  ? `Mulai berlaku ${startDate}`
                  : `Diterbitkan ${formatDateTime(announcement.createdAt)}`}
              </span>
            </div>

            {endDate ? (
              <div className="flex items-start gap-2">
                <CalendarRange className="mt-0.5 size-4 shrink-0" />

                <span>Berlaku sampai {endDate}</span>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8 lg:py-16">
        <article className="min-w-0">
          <div className="whitespace-pre-wrap break-words text-base leading-8 text-foreground/90">
            {announcement.content}
          </div>

          {attachmentUrl ? (
            <Card className="mt-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Paperclip className="size-5 text-primary" />
                  Lampiran Pengumuman
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pengumuman ini memiliki dokumen atau tautan tambahan yang
                  dapat dibuka pada tab baru.
                </p>

                <Button className="mt-5" asChild>
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Paperclip className="size-4" />
                    Buka lampiran
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pengumuman</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="text-sm text-muted-foreground">Prioritas</dt>

                  <dd className="mt-1 font-medium">
                    {priorityLabels[announcement.priority]}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>

                  <dd className="mt-1 font-medium">Aktif</dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">
                    Mulai berlaku
                  </dt>

                  <dd className="mt-1 font-medium">
                    {startDate ?? "Sejak diterbitkan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Berakhir</dt>

                  <dd className="mt-1 font-medium">
                    {endDate ?? "Tidak dibatasi"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">
                    Terakhir diperbarui
                  </dt>

                  <dd className="mt-1 font-medium">
                    {formatDateTime(announcement.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>

      {relatedAnnouncements.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <Megaphone className="size-3.5" />
                Informasi Lainnya
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Pengumuman terkait
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedAnnouncements.map((related) => (
                <Card key={related.id}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge priority={related.priority} />

                      {related.isPinned ? (
                        <Badge variant="secondary">
                          <Pin className="size-3" />
                          Disematkan
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="line-clamp-3 text-xl">
                      <Link
                        href={`/pengumuman/${related.slug}`}
                        className="hover:text-primary"
                      >
                        {related.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {createDescription(related.content)}
                    </p>

                    <p className="mt-4 text-xs text-muted-foreground">
                      {formatDateTime(related.startDate ?? related.createdAt)}
                    </p>

                    <Button variant="link" className="mt-4 h-auto p-0" asChild>
                      <Link href={`/pengumuman/${related.slug}`}>
                        Baca pengumuman
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
