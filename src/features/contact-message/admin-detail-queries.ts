import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const adminContactMessageDetailSelect = {
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

export const getAdminContactMessageById = cache(async (messageId: string) => {
  return prisma.contactMessage.findUnique({
    where: {
      id: messageId,
    },

    select: adminContactMessageDetailSelect,
  });
});
