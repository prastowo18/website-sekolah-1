import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getPublishedProgramWhere(now: Date): Prisma.ProgramWhereInput {
  return {
    isActive: true,
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

export type PublicProgramListParams = {
  q: string;
  featured: "all" | "featured" | "regular";
  page: number;
  pageSize: number;
};

export async function getPublicProgramList({
  q,
  featured,
  page,
  pageSize,
}: PublicProgramListParams) {
  const now = new Date();

  const filters: Prisma.ProgramWhereInput[] = [getPublishedProgramWhere(now)];

  if (q) {
    filters.push({
      OR: [
        {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          shortDescription: {
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

  if (featured === "featured") {
    filters.push({
      isFeatured: true,
    });
  }

  if (featured === "regular") {
    filters.push({
      isFeatured: false,
    });
  }

  const where: Prisma.ProgramWhereInput = {
    AND: filters,
  };

  const total = await prisma.program.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const programs = await prisma.program.findMany({
    where,
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        sortOrder: "asc",
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
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      imageUrl: true,
      benefits: true,
      isFeatured: true,
      sortOrder: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    programs,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicProgramBySlug = cache(async (slug: string) => {
  const now = new Date();

  return prisma.program.findFirst({
    where: {
      AND: [
        getPublishedProgramWhere(now),
        {
          slug,
        },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      imageUrl: true,
      benefits: true,
      isFeatured: true,
      sortOrder: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export async function getRelatedPublicPrograms({
  programId,
  limit = 3,
}: {
  programId: string;
  limit?: number;
}) {
  const now = new Date();

  return prisma.program.findMany({
    where: {
      AND: [
        getPublishedProgramWhere(now),
        {
          id: {
            not: programId,
          },
        },
      ],
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      imageUrl: true,
      benefits: true,
      isFeatured: true,
    },
  });
}
