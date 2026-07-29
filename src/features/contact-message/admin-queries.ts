import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { ContactMessageStatusValue } from "./constants";

const adminContactMessageSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  status: true,
  sourcePage: true,
  assignedToId: true,
  readAt: true,
  repliedAt: true,
  createdAt: true,
  updatedAt: true,

  assignedTo: {
    select: {
      id: true,
      name: true,
      username: true,
    },
  },
} satisfies Prisma.ContactMessageSelect;

export type AdminContactMessageListParams = {
  q: string;

  status: "all" | ContactMessageStatusValue;

  assignedTo: "all" | "unassigned" | string;

  page: number;
  pageSize: number;
};

export async function getAdminContactMessages({
  q,
  status,
  assignedTo,
  page,
  pageSize,
}: AdminContactMessageListParams) {
  const filters: Prisma.ContactMessageWhereInput[] = [];

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
          email: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          phone: {
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
          message: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (status !== "all") {
    filters.push({
      status,
    });
  }

  if (assignedTo === "unassigned") {
    filters.push({
      assignedToId: null,
    });
  } else if (assignedTo !== "all") {
    filters.push({
      assignedToId: assignedTo,
    });
  }

  const where: Prisma.ContactMessageWhereInput =
    filters.length > 0
      ? {
          AND: filters,
        }
      : {};

  const total = await prisma.contactMessage.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const messages = await prisma.contactMessage.findMany({
    where,

    orderBy: [
      {
        createdAt: "desc",
      },
    ],

    skip: (currentPage - 1) * pageSize,

    take: pageSize,

    select: adminContactMessageSelect,
  });

  return {
    messages,
    total,
    totalPages,
    currentPage,
  };
}

export async function getAdminContactAssignees() {
  return prisma.user.findMany({
    where: {
      isActive: true,

      role: {
        in: ["SUPER_ADMIN", "CONTENT_ADMIN"],
      },
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
  });
}

export async function getAdminContactMessageCounts() {
  const grouped = await prisma.contactMessage.groupBy({
    by: ["status"],

    _count: {
      _all: true,
    },
  });

  const counts: Record<ContactMessageStatusValue, number> & {
    total: number;
  } = {
    total: 0,
    NEW: 0,
    READ: 0,
    REPLIED: 0,
    CLOSED: 0,
    SPAM: 0,
  };

  for (const item of grouped) {
    const count = item._count._all;

    counts[item.status] = count;
    counts.total += count;
  }

  return counts;
}
