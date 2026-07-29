import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getPublishedAchievementWhere(now: Date): Prisma.AchievementWhereInput {
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

export type PublicAchievementType = "all" | "STUDENT" | "TEACHER" | "SCHOOL";

export type PublicCompetitionLevel =
  | "all"
  | "SCHOOL"
  | "DISTRICT"
  | "CITY"
  | "PROVINCE"
  | "NATIONAL"
  | "INTERNATIONAL";

export type PublicAchievementListParams = {
  q: string;
  achievementType: PublicAchievementType;
  competitionLevel: PublicCompetitionLevel;
  page: number;
  pageSize: number;
};

export async function getPublicAchievementList({
  q,
  achievementType,
  competitionLevel,
  page,
  pageSize,
}: PublicAchievementListParams) {
  const now = new Date();

  const filters: Prisma.AchievementWhereInput[] = [
    getPublishedAchievementWhere(now),
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
          winnerName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          category: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          rank: {
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

  if (achievementType !== "all") {
    filters.push({
      achievementType,
    });
  }

  if (competitionLevel !== "all") {
    filters.push({
      competitionLevel,
    });
  }

  const where: Prisma.AchievementWhereInput = {
    AND: filters,
  };

  const total = await prisma.achievement.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const achievements = await prisma.achievement.findMany({
    where,
    orderBy: [
      {
        achievementDate: "desc",
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
      achievementType: true,
      category: true,
      winnerName: true,
      competitionLevel: true,
      rank: true,
      achievementDate: true,
      description: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    achievements,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicAchievementBySlug = cache(async (slug: string) => {
  const now = new Date();

  return prisma.achievement.findFirst({
    where: {
      AND: [
        getPublishedAchievementWhere(now),
        {
          slug,
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      achievementType: true,
      category: true,
      winnerName: true,
      competitionLevel: true,
      rank: true,
      achievementDate: true,
      description: true,
      imageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export async function getRelatedPublicAchievements({
  achievementId,
  achievementType,
  limit = 3,
}: {
  achievementId: string;
  achievementType: "STUDENT" | "TEACHER" | "SCHOOL";
  limit?: number;
}) {
  const now = new Date();

  return prisma.achievement.findMany({
    where: {
      AND: [
        getPublishedAchievementWhere(now),
        {
          id: {
            not: achievementId,
          },
        },
        {
          achievementType,
        },
      ],
    },
    orderBy: [
      {
        achievementDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      achievementType: true,
      category: true,
      winnerName: true,
      competitionLevel: true,
      rank: true,
      achievementDate: true,
      description: true,
      imageUrl: true,
    },
  });
}
