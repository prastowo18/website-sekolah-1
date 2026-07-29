import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicAnnouncementPriority =
  "all" | "NORMAL" | "IMPORTANT" | "URGENT";

type AnnouncementPriorityValue = "NORMAL" | "IMPORTANT" | "URGENT";

function getVisibleAnnouncementWhere(now: Date): Prisma.AnnouncementWhereInput {
  return {
    isActive: true,

    AND: [
      {
        OR: [
          {
            startDate: null,
          },
          {
            startDate: {
              lte: now,
            },
          },
        ],
      },
      {
        OR: [
          {
            endDate: null,
          },
          {
            endDate: {
              gte: now,
            },
          },
        ],
      },
    ],
  };
}

export type PublicAnnouncementListParams = {
  q: string;
  priority: PublicAnnouncementPriority;
  page: number;
  pageSize: number;
};

const announcementPublicSelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  priority: true,
  attachmentUrl: true,
  startDate: true,
  endDate: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AnnouncementSelect;

export async function getPublicAnnouncementList({
  q,
  priority,
  page,
  pageSize,
}: PublicAnnouncementListParams) {
  const now = new Date();

  const filters: Prisma.AnnouncementWhereInput[] = [
    getVisibleAnnouncementWhere(now),
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
          content: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (priority !== "all") {
    filters.push({
      priority,
    });
  }

  const where: Prisma.AnnouncementWhereInput = {
    AND: filters,
  };

  const total = await prisma.announcement.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        priority: "desc",
      },
      {
        startDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: announcementPublicSelect,
  });

  return {
    announcements,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicAnnouncementBySlug = cache(async (slug: string) => {
  const now = new Date();

  return prisma.announcement.findFirst({
    where: {
      AND: [
        getVisibleAnnouncementWhere(now),
        {
          slug,
        },
      ],
    },
    select: announcementPublicSelect,
  });
});

export async function getRelatedPublicAnnouncements({
  announcementId,
  priority,
  limit = 3,
}: {
  announcementId: string;
  priority: AnnouncementPriorityValue;
  limit?: number;
}) {
  const now = new Date();

  const related = await prisma.announcement.findMany({
    where: {
      AND: [
        getVisibleAnnouncementWhere(now),
        {
          id: {
            not: announcementId,
          },
        },
        {
          priority,
        },
      ],
    },
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        startDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit,
    select: announcementPublicSelect,
  });

  if (related.length >= limit) {
    return related;
  }

  const additional = await prisma.announcement.findMany({
    where: {
      AND: [
        getVisibleAnnouncementWhere(now),
        {
          id: {
            notIn: [
              announcementId,
              ...related.map((announcement) => announcement.id),
            ],
          },
        },
      ],
    },
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        priority: "desc",
      },
      {
        startDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit - related.length,
    select: announcementPublicSelect,
  });

  return [...related, ...additional];
}
