"use server";

import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import { updateContactMessageSchema } from "./admin-schemas";
import type { ContactMessageActionState } from "./types";

function getFieldErrors(error: {
  flatten(): {
    fieldErrors: Record<string, string[] | undefined>;
  };
}) {
  return error.flatten().fieldErrors;
}

export async function updateContactMessageAction(
  _previousState: ContactMessageActionState,
  formData: FormData,
): Promise<ContactMessageActionState> {
  const actor = await requireAdminRole([
    UserRole.SUPER_ADMIN,
    UserRole.CONTENT_ADMIN,
  ]);

  const rawAssignedToId = String(formData.get("assignedToId") ?? "");

  const parsed = updateContactMessageSchema.safeParse({
    messageId: formData.get("messageId"),

    status: formData.get("status"),

    assignedToId:
      rawAssignedToId === "unassigned" ? undefined : rawAssignedToId,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali status dan penanggung jawab pesan.",
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const { messageId, status, assignedToId } = parsed.data;

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.contactMessage.findUnique({
        where: {
          id: messageId,
        },

        select: {
          id: true,
          status: true,
          assignedToId: true,
          readAt: true,
          repliedAt: true,
        },
      });

      if (!current) {
        return {
          type: "not-found" as const,
        };
      }

      if (assignedToId) {
        const assignee = await transaction.user.findFirst({
          where: {
            id: assignedToId,
            isActive: true,

            role: {
              in: [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN],
            },
          },

          select: {
            id: true,
          },
        });

        if (!assignee) {
          return {
            type: "invalid-assignee" as const,
          };
        }
      }

      const changedAt = new Date();

      const readAt = status === "NEW" ? null : (current.readAt ?? changedAt);

      const repliedAt =
        status === "REPLIED"
          ? (current.repliedAt ?? changedAt)
          : current.repliedAt;

      const updated = await transaction.contactMessage.update({
        where: {
          id: messageId,
        },

        data: {
          status,

          assignedToId: assignedToId ?? null,

          readAt,
          repliedAt,
        },

        select: {
          status: true,
          assignedToId: true,
          readAt: true,
          repliedAt: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: actor.user.id,

          action: "CONTACT_MESSAGE_UPDATED",

          entity: "ContactMessage",

          entityId: messageId,

          oldValue: {
            status: current.status,

            assignedToId: current.assignedToId,

            readAt: current.readAt?.toISOString() ?? null,

            repliedAt: current.repliedAt?.toISOString() ?? null,
          },

          newValue: {
            status: updated.status,

            assignedToId: updated.assignedToId,

            readAt: updated.readAt?.toISOString() ?? null,

            repliedAt: updated.repliedAt?.toISOString() ?? null,
          },
        },
      });

      return {
        type: "updated" as const,
      };
    });

    if (result.type === "not-found") {
      return {
        status: "error",
        message: "Pesan kontak tidak ditemukan.",
      };
    }

    if (result.type === "invalid-assignee") {
      return {
        status: "error",
        message: "Penanggung jawab tidak aktif atau tidak memiliki izin.",
      };
    }

    revalidatePath("/admin/pesan-kontak");

    revalidatePath(`/admin/pesan-kontak/${messageId}`);

    revalidatePath("/admin/dashboard");

    return {
      status: "success",
      message: "Pesan kontak berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update contact message failed:", error);

    return {
      status: "error",
      message: "Pesan kontak belum dapat diperbarui.",
    };
  }
}
