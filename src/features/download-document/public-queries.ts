import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicDocumentListParams = {
  q: string;
  category: string;
  fileType: string;
  page: number;
  pageSize: number;
};

export async function getPublicDocumentList({
  q,
  category,
  fileType,
  page,
  pageSize,
}: PublicDocumentListParams) {
  const filters: Prisma.DownloadDocumentWhereInput[] = [
    {
      isActive: true,
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
          description: {
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
          fileName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          fileType: {
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

  if (fileType) {
    filters.push({
      fileType,
    });
  }

  const where: Prisma.DownloadDocumentWhereInput = {
    AND: filters,
  };

  const total = await prisma.downloadDocument.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const documents = await prisma.downloadDocument.findMany({
    where,
    orderBy: [
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
      category: true,
      fileName: true,
      fileSizeBytes: true,
      fileType: true,
      downloadCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    documents,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicDocumentFilters = cache(async () => {
  const [categoryRecords, fileTypeRecords] = await Promise.all([
    prisma.downloadDocument.findMany({
      where: {
        isActive: true,
        category: {
          not: null,
        },
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
      select: {
        category: true,
      },
    }),

    prisma.downloadDocument.findMany({
      where: {
        isActive: true,
        fileType: {
          not: null,
        },
      },
      distinct: ["fileType"],
      orderBy: {
        fileType: "asc",
      },
      select: {
        fileType: true,
      },
    }),
  ]);

  return {
    categories: categoryRecords
      .map((record) => record.category)
      .filter((value): value is string => Boolean(value)),

    fileTypes: fileTypeRecords
      .map((record) => record.fileType)
      .filter((value): value is string => Boolean(value)),
  };
});

export const getPublicDocumentBySlug = cache(async (slug: string) => {
  return prisma.downloadDocument.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      fileName: true,
      fileSizeBytes: true,
      fileType: true,
      downloadCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
