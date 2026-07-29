import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getActiveFacilityWhere(): Prisma.FacilityWhereInput {
  return {
    isActive: true,
  };
}

export type PublicFacilityListParams = {
  q: string;
  page: number;
  pageSize: number;
};

export async function getPublicFacilityList({
  q,
  page,
  pageSize,
}: PublicFacilityListParams) {
  const filters: Prisma.FacilityWhereInput[] = [getActiveFacilityWhere()];

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
      ],
    });
  }

  const where: Prisma.FacilityWhereInput = {
    AND: filters,
  };

  const total = await prisma.facility.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const facilities = await prisma.facility.findMany({
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
      imageUrl: true,
      capacity: true,
      condition: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    facilities,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicFacilityBySlug = cache(async (slug: string) => {
  return prisma.facility.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      capacity: true,
      condition: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export async function getRelatedPublicFacilities({
  facilityId,
  limit = 3,
}: {
  facilityId: string;
  limit?: number;
}) {
  return prisma.facility.findMany({
    where: {
      isActive: true,
      id: {
        not: facilityId,
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
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      capacity: true,
      condition: true,
    },
  });
}
