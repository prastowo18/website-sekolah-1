import { ContactMessageStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type MarkContactMessageAsReadParams = {
  messageId: string;
  actorId: string;
};

export async function markContactMessageAsRead({
  messageId,
  actorId,
}: MarkContactMessageAsReadParams): Promise<boolean> {
  try {
    return await prisma.$transaction(async (transaction) => {
      const current = await transaction.contactMessage.findUnique({
        where: {
          id: messageId,
        },

        select: {
          id: true,
          status: true,
          readAt: true,
        },
      });

      if (!current || current.status !== ContactMessageStatus.NEW) {
        return false;
      }

      const readAt = new Date();

      const updated = await transaction.contactMessage.updateMany({
        where: {
          id: messageId,
          status: ContactMessageStatus.NEW,
        },

        data: {
          status: ContactMessageStatus.READ,
          readAt,
        },
      });

      if (updated.count === 0) {
        return false;
      }

      await transaction.auditLog.create({
        data: {
          actorId,
          action: "CONTACT_MESSAGE_READ",
          entity: "ContactMessage",
          entityId: messageId,

          oldValue: {
            status: current.status,
            readAt: current.readAt?.toISOString() ?? null,
          },

          newValue: {
            status: ContactMessageStatus.READ,
            readAt: readAt.toISOString(),
          },
        },
      });

      return true;
    });
  } catch (error) {
    console.error("Mark contact message as read failed:", error);

    return false;
  }
}
