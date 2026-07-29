import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function getPublishedPostWhere(now: Date): Prisma.PostWhereInput {
  return {
    status: "PUBLISHED",
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

export type PublicPostListParams = {
  q: string;
  categorySlug: string;
  page: number;
  pageSize: number;
};

export async function getPublicPostList({
  q,
  categorySlug,
  page,
  pageSize,
}: PublicPostListParams) {
  const now = new Date();

  const filters: Prisma.PostWhereInput[] = [getPublishedPostWhere(now)];

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
          excerpt: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (categorySlug) {
    filters.push({
      category: {
        slug: categorySlug,
      },
    });
  }

  const where: Prisma.PostWhereInput = {
    AND: filters,
  };

  const total = await prisma.post.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: [
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
      excerpt: true,
      featuredImageUrl: true,
      publishedAt: true,
      createdAt: true,
      viewCount: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    posts,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicPostCategories = cache(async () => {
  const now = new Date();

  return prisma.postCategory.findMany({
    where: {
      posts: {
        some: getPublishedPostWhere(now),
      },
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
});

export const getPublicPostBySlug = cache(async (slug: string) => {
  const now = new Date();

  return prisma.post.findFirst({
    where: {
      AND: [
        getPublishedPostWhere(now),
        {
          slug,
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      viewCount: true,
      seoTitle: true,
      seoDescription: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
});

export async function getRelatedPublicPosts({
  postId,
  categoryId,
  limit = 3,
}: {
  postId: string;
  categoryId: string | null;
  limit?: number;
}) {
  const now = new Date();

  const filters: Prisma.PostWhereInput[] = [
    getPublishedPostWhere(now),
    {
      id: {
        not: postId,
      },
    },
  ];

  if (categoryId) {
    filters.push({
      categoryId,
    });
  }

  return prisma.post.findMany({
    where: {
      AND: filters,
    },
    orderBy: [
      {
        publishedAt: "desc",
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
      excerpt: true,
      featuredImageUrl: true,
      publishedAt: true,
      createdAt: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}
