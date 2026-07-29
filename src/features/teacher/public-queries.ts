import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type PublicTeacherRole = "all" | "principal" | "teacher";

export type PublicTeacherListParams = {
  q: string;
  role: PublicTeacherRole;
  subject: string;
  page: number;
  pageSize: number;
};

export async function getPublicTeacherList({
  q,
  role,
  subject,
  page,
  pageSize,
}: PublicTeacherListParams) {
  const filters: Prisma.TeacherWhereInput[] = [
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
          position: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          subject: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          education: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          shortBiography: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (role === "principal") {
    filters.push({
      isPrincipal: true,
    });
  }

  if (role === "teacher") {
    filters.push({
      isPrincipal: false,
    });
  }

  if (subject) {
    filters.push({
      subject,
    });
  }

  const where: Prisma.TeacherWhereInput = {
    AND: filters,
  };

  const total = await prisma.teacher.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const teachers = await prisma.teacher.findMany({
    where,
    orderBy: [
      {
        isPrincipal: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      name: true,
      slug: true,
      position: true,
      subject: true,
      education: true,
      shortBiography: true,
      photoUrl: true,
      isPrincipal: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    teachers,
    total,
    totalPages,
    currentPage,
  };
}

export const getPublicTeacherFilters = cache(async () => {
  const teachers = await prisma.teacher.findMany({
    where: {
      isActive: true,
      subject: {
        not: null,
      },
    },
    select: {
      subject: true,
    },
  });

  const subjects = Array.from(
    new Set(
      teachers
        .map((teacher) => teacher.subject?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((first, second) =>
    first.localeCompare(second, "id-ID", {
      sensitivity: "base",
    }),
  );

  return {
    subjects,
  };
});

export const getPublicTeacherBySlug = cache(async (slug: string) => {
  return prisma.teacher.findFirst({
    where: {
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      position: true,
      subject: true,
      education: true,
      shortBiography: true,
      photoUrl: true,
      isPrincipal: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export async function getRelatedPublicTeachers({
  teacherId,
  subject,
  limit = 3,
}: {
  teacherId: string;
  subject: string | null;
  limit?: number;
}) {
  const related = subject
    ? await prisma.teacher.findMany({
        where: {
          isActive: true,
          id: {
            not: teacherId,
          },
          subject,
        },
        orderBy: [
          {
            isPrincipal: "desc",
          },
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          position: true,
          subject: true,
          education: true,
          shortBiography: true,
          photoUrl: true,
          isPrincipal: true,
        },
      })
    : [];

  if (related.length >= limit) {
    return related;
  }

  const additional = await prisma.teacher.findMany({
    where: {
      isActive: true,
      id: {
        notIn: [teacherId, ...related.map((teacher) => teacher.id)],
      },
    },
    orderBy: [
      {
        isPrincipal: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    take: limit - related.length,
    select: {
      id: true,
      name: true,
      slug: true,
      position: true,
      subject: true,
      education: true,
      shortBiography: true,
      photoUrl: true,
      isPrincipal: true,
    },
  });

  return [...related, ...additional];
}
