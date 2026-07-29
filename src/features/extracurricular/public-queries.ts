import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getActiveExtracurricularWhere(): Prisma.ExtracurricularWhereInput {
  return {
    isActive: true,
  };
}

export type PublicExtracurricularListParams = {
  q: string;
  targetClass: string;
  page: number;
  pageSize: number;
};

export async function getPublicExtracurricularList({
  q,
  targetClass,
  page,
  pageSize,
}: PublicExtracurricularListParams) {
  const filters: Prisma.ExtracurricularWhereInput[] = [
    getActiveExtracurricularWhere(),
  ];

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
          description: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          schedule: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          coach: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (targetClass) {
    filters.push({
      targetClasses: {
        has: targetClass,
      },
    });
  }

  const where: Prisma.ExtracurricularWhereInput = {
    AND: filters,
  };

  const total = await prisma.extracurricular.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const extracurriculars = await prisma.extracurricular.findMany({
    where,
    orderBy: [
      {
        sortOrder: "asc",
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
      description: true,
      schedule: true,
      coach: true,
      targetClasses: true,
      imageUrl: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    extracurriculars,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicExtracurricularFilters = cache(async () => {
  const records = await prisma.extracurricular.findMany({
    where: {
      isActive: true,
    },
    select: {
      targetClasses: true,
    },
  });

  const targetClasses = Array.from(
    new Set(records.flatMap((record) => record.targetClasses)),
  )
    .map((value) => value.trim())
    .filter(Boolean)
    .sort((first, second) =>
      first.localeCompare(second, "id-ID", {
        numeric: true,
        sensitivity: "base",
      }),
    );

  return {
    targetClasses,
  };
});

export const getPublicExtracurricularBySlug = cache(async (slug: string) => {
  return prisma.extracurricular.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      schedule: true,
      coach: true,
      targetClasses: true,
      imageUrl: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export async function getRelatedPublicExtracurriculars({
  extracurricularId,
  targetClasses,
  limit = 3,
}: {
  extracurricularId: string;
  targetClasses: string[];
  limit?: number;
}) {
  const related = await prisma.extracurricular.findMany({
    where: {
      isActive: true,
      id: {
        not: extracurricularId,
      },

      ...(targetClasses.length > 0
        ? {
            targetClasses: {
              hasSome: targetClasses,
            },
          }
        : {}),
    },
    orderBy: [
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
      description: true,
      schedule: true,
      coach: true,
      targetClasses: true,
      imageUrl: true,
    },
  });

  if (related.length >= limit) {
    return related;
  }

  const additional = await prisma.extracurricular.findMany({
    where: {
      isActive: true,
      id: {
        notIn: [extracurricularId, ...related.map((item) => item.id)],
      },
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: limit - related.length,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      schedule: true,
      coach: true,
      targetClasses: true,
      imageUrl: true,
    },
  });

  return [...related, ...additional];
}
