import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Images } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicGalleryMedia } from "@/features/gallery/components/public-gallery-media";
import { getPublicGalleryAlbumBySlug } from "@/features/gallery/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

type PageParams = {
  slug: string;
};

function formatDate(value: Date | null): string {
  if (!value) {
    return "Tanggal kegiatan belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function createDescription(value: string | null): string {
  return (
    value?.replace(/\s+/g, " ").trim().slice(0, 160) ??
    "Dokumentasi kegiatan sekolah."
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/galeri/${encodeURIComponent(slug)}`;

  const album = await getPublicGalleryAlbumBySlug(slug);

  if (!album) {
    return {
      title: "Album Tidak Ditemukan",
    };
  }

  const coverUrl = getSafePublicUrl(album.coverImageUrl);

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: album.title,
    description: createDescription(album.description),
    openGraph: coverUrl
      ? {
          url: canonicalPath,
          title: album.title,
          description: createDescription(album.description),
          images: [coverUrl],
        }
      : undefined,
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const album = await getPublicGalleryAlbumBySlug(slug);

  if (!album) {
    notFound();
  }

  return (
    <main>
      <InformationPagesMotionController pageId="gallery-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/galeri">
              <ArrowLeft className="size-4" />
              Kembali ke galeri
            </Link>
          </Button>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge variant="outline">
              <Images className="size-3.5" />
              {album.media.length} media
            </Badge>

            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              {formatDate(album.eventDate)}
            </div>
          </div>

          <h1 className="mt-6 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-5 max-w-3xl whitespace-pre-line text-lg leading-8 text-muted-foreground">
              {album.description}
            </p>
          ) : null}
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {album.media.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <Images className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">Media belum tersedia</h2>

            <p className="mt-2 text-muted-foreground">
              Album ini sudah dipublikasikan, tetapi belum memiliki media.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {album.media.map((item, index) => (
              <PublicGalleryMedia
                key={item.id}
                item={item}
                albumTitle={album.title}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
