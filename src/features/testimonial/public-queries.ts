import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const publicTestimonialSelect = {
  id: true,
  name: true,
  role: true,
  content: true,
  photoUrl: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TestimonialSelect;

export type PublicTestimonialListParams = {
  q: string;
  role: string;
  page: number;
  pageSize: number;
};

export async function getPublicTestimonialList({
  q,
  role,
  page,
  pageSize,
}: PublicTestimonialListParams) {
  const filters: Prisma.TestimonialWhereInput[] = [
    {
      isPublished: true,
    },
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
          role: {
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

  if (role) {
    filters.push({
      role,
    });
  }

  const where: Prisma.TestimonialWhereInput = {
    AND: filters,
  };

  const total = await prisma.testimonial.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const testimonials = await prisma.testimonial.findMany({
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
    select: publicTestimonialSelect,
  });

  return {
    testimonials,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicTestimonialRoles = cache(async () => {
  const records = await prisma.testimonial.findMany({
    where: {
      isPublished: true,
      role: {
        not: null,
      },
    },
    orderBy: {
      role: "asc",
    },
    select: {
      role: true,
    },
  });

  return Array.from(
    new Set(
      records
        .map((record) => record.role?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((first, second) =>
    first.localeCompare(second, "id-ID", {
      sensitivity: "base",
    }),
  );
});
