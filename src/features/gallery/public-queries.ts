import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getPublishedAlbumWhere(now: Date): Prisma.GalleryAlbumWhereInput {
  return {
    isPublished: true,
    OR: [
      {
        publishedAt: null,
      },
      {
        publishedAt: {
          lte: now,
        },
      },
    ],
  };
}

export type PublicGalleryListParams = {
  q: string;
  page: number;
  pageSize: number;
};

export async function getPublicGalleryAlbumList({
  q,
  page,
  pageSize,
}: PublicGalleryListParams) {
  const now = new Date();

  const filters: Prisma.GalleryAlbumWhereInput[] = [
    getPublishedAlbumWhere(now),
  ];

  if (q) {
    filters.push({
      OR: [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const where: Prisma.GalleryAlbumWhereInput = {
    AND: filters,
  };

  const total = await prisma.galleryAlbum.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const albums = await prisma.galleryAlbum.findMany({
    where,
    orderBy: [
      {
        eventDate: "desc",
      },
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      eventDate: true,
      coverImageUrl: true,
      publishedAt: true,
      createdAt: true,

      media: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        take: 1,
        select: {
          id: true,
          mediaType: true,
          fileUrl: true,
          thumbnailUrl: true,
          altText: true,
        },
      },

      _count: {
        select: {
          media: true,
        },
      },
    },
  });

  return {
    albums,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicGalleryAlbumBySlug = cache(async (slug: string) => {
  const now = new Date();

  return prisma.galleryAlbum.findFirst({
    where: {
      AND: [
        getPublishedAlbumWhere(now),
        {
          slug,
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      eventDate: true,
      coverImageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,

      media: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          mediaType: true,
          fileUrl: true,
          thumbnailUrl: true,
          caption: true,
          altText: true,
          sortOrder: true,
        },
      },
    },
  });
});
