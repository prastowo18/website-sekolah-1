import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const publicFaqSelect = {
  id: true,
  question: true,
  answer: true,
  category: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FaqSelect;

export type PublicFaqListParams = {
  q: string;
  category: string;
  page: number;
  pageSize: number;
};

export async function getPublicFaqList({
  q,
  category,
  page,
  pageSize,
}: PublicFaqListParams) {
  const filters: Prisma.FaqWhereInput[] = [
    {
      isActive: true,
    },
  ];

  if (q) {
    filters.push({
      OR: [
        {
          question: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          answer: {
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
      ],
    });
  }

  if (category) {
    filters.push({
      category,
    });
  }

  const where: Prisma.FaqWhereInput = {
    AND: filters,
  };

  const total = await prisma.faq.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const faqs = await prisma.faq.findMany({
    where,
    orderBy: [
      {
        category: "asc",
      },
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: publicFaqSelect,
  });

  return {
    faqs,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicFaqCategories = cache(async () => {
  const records = await prisma.faq.findMany({
    where: {
      isActive: true,
      category: {
        not: null,
      },
    },
    orderBy: [
      {
        category: "asc",
      },
      {
        sortOrder: "asc",
      },
    ],
    select: {
      category: true,
    },
  });

  const categories = Array.from(
    new Set(
      records
        .map((record) => record.category?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((first, second) =>
    first.localeCompare(second, "id-ID", {
      sensitivity: "base",
    }),
  );

  return categories;
});
