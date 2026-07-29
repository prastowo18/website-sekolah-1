import { ContactMessageStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getContactMessageDashboardSummary() {
  const [
    total,
    newMessages,
    readMessages,
    repliedMessages,
    closedMessages,
    spamMessages,
    recentMessages,
  ] = await Promise.all([
    prisma.contactMessage.count(),

    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.NEW,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.READ,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.REPLIED,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.CLOSED,
      },
    }),

    prisma.contactMessage.count({
      where: {
        status: ContactMessageStatus.SPAM,
      },
    }),

    prisma.contactMessage.findMany({
      where: {
        status: {
          not: ContactMessageStatus.SPAM,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        name: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    total,
    newMessages,
    readMessages,
    repliedMessages,
    closedMessages,
    spamMessages,
    recentMessages,
  };
}
