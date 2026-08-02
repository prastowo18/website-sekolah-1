"use server";

import { redirect } from "next/navigation";

import { getAuditRequestContext } from "@/lib/audit/request-context";
import { deleteCurrentSession, getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function reportLogoutAuditError(error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Pencatatan logout gagal.", error);
    return;
  }

  console.error("Pencatatan logout gagal.", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
}

export async function logoutAction(): Promise<never> {
  const session = await getCurrentSession();

  if (session) {
    try {
      const context = await getAuditRequestContext();

      await prisma.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "LOGOUT",
          entity: "User",
          entityId: session.user.id,
          newValue: {
            loggedOut: true,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
      });
    } catch (error: unknown) {
      reportLogoutAuditError(error);
    }
  }

  await deleteCurrentSession();

  redirect("/konsol-8m4q7x2k9v6d/login");
}
