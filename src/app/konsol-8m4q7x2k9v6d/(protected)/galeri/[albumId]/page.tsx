import type { Metadata } from "next";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

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
import { GalleryAlbumFormDialog } from "@/features/gallery/components/gallery-album-form-dialog";
import { GalleryMediaFormDialog } from "@/features/gallery/components/gallery-media-form-dialog";
import { GalleryMediaTable } from "@/features/gallery/components/gallery-media-table";
import {
  galleryMediaTypeLabels,
  galleryMediaTypes,
  type GalleryMediaTypeValue,
} from "@/features/gallery/constants";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Media Galeri | Panel Administrasi",
};

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
  page?: string | string[];
};

type MediaTypeFilter = "all" | GalleryMediaTypeValue;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeType(value: string): MediaTypeFilter {
  return galleryMediaTypes.includes(value as GalleryMediaTypeValue)
    ? (value as GalleryMediaTypeValue)
    : "all";
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  albumId,
  q,
  type,
  page,
}: {
  albumId: string;
  q: string;
  type: MediaTypeFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (type !== "all") {
    parameters.set("type", type);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();
  const pathname = `/konsol-8m4q7x2k9v6d/galeri/${albumId}`;

  return query ? `${pathname}?${query}` : pathname;
}

export default async function GalleryMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{
    albumId: string;
  }>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const { albumId } = await params;
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const type = normalizeType(firstValue(parameters.type));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const [album, albumOptions] = await Promise.all([
    prisma.galleryAlbum.findUnique({
      where: {
        id: albumId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        eventDate: true,
        coverImageUrl: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.galleryAlbum.findMany({
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
      },
    }),
  ]);

  if (!album) {
    notFound();
  }

  const where: Prisma.GalleryMediaWhereInput = {
    albumId: album.id,
  };

  if (q) {
    where.OR = [
      {
        fileUrl: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        caption: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        altText: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (type !== "all") {
    where.mediaType = type;
  }

  const total = await prisma.galleryMedia.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const media = await prisma.galleryMedia.findMany({
    where,
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      albumId: true,
      mediaType: true,
      fileUrl: true,
      thumbnailUrl: true,
      caption: true,
      altText: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serializedAlbum = {
    id: album.id,
    title: album.title,
    slug: album.slug,
    description: album.description,
    eventDate: album.eventDate?.toISOString().slice(0, 10) ?? null,
    coverImageUrl: album.coverImageUrl,
    isPublished: album.isPublished,
    publishedAt: album.publishedAt?.toISOString() ?? null,
    createdAt: album.createdAt.toISOString(),
    updatedAt: album.updatedAt.toISOString(),
  };

  const serializedMedia = media.map((item) => ({
    id: item.id,
    albumId: item.albumId,
    mediaType: item.mediaType,
    fileUrl: item.fileUrl,
    thumbnailUrl: item.thumbnailUrl,
    caption: item.caption,
    altText: item.altText,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-3">
          <Link href="/konsol-8m4q7x2k9v6d/galeri">
            <ArrowLeft className="size-4" />
            Kembali ke galeri
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {album.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Kelola gambar, video, dan YouTube dalam album ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <>
                <GalleryAlbumFormDialog album={serializedAlbum} />

                <GalleryMediaFormDialog
                  albums={albumOptions}
                  defaultAlbumId={album.id}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pencarian dan filter media
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari URL, keterangan, atau teks alternatif..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="type" defaultValue={type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua jenis" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua jenis</SelectItem>

                {galleryMediaTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {galleryMediaTypeLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || type !== "all" ? (
              <Button variant="outline" asChild>
                <Link href={`/konsol-8m4q7x2k9v6d/galeri/${album.id}`}>
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <GalleryMediaTable
        media={serializedMedia}
        albums={albumOptions}
        currentAlbumId={album.id}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} media.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  albumId: album.id,
                  q,
                  type,
                  page: currentPage - 1,
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
            Halaman {currentPage} dari {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  albumId: album.id,
                  q,
                  type,
                  page: currentPage + 1,
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
  );
}
