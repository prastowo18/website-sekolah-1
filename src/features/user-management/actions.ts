"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import { Prisma, UserRole } from "@/generated/prisma/client";
import {
  getAuditRequestContext,
  type AuditRequestContext,
} from "@/lib/audit/request-context";
import { requireAdminRole } from "@/lib/auth/authorization";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

import {
  changeUserStatusSchema,
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  userIdSchema,
} from "./schemas";

const USER_ROUTE = "/konsol-8m4q7x2k9v6d/pengguna";
const AUDIT_ROUTE = "/konsol-8m4q7x2k9v6d/audit-log";

const superAdminOnly = [UserRole.SUPER_ADMIN] as const;

const auditUserSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  lastLoginAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

type AuditUser = Prisma.UserGetPayload<{
  select: typeof auditUserSelect;
}>;

type AuditWriteInput = {
  actorId: string;
  action: string;
  entityId: string;
  context: AuditRequestContext;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
};

function firstIssueMessage(error: {
  issues: Array<{
    message: string;
  }>;
}): string {
  return error.issues[0]?.message ?? "Data pengguna tidak valid.";
}

function reportActionError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(context, error);
    return;
  }

  console.error(context, {
    name: error instanceof Error ? error.name : "UnknownError",
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function toAuditUser(user: AuditUser) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    failedLoginAttempts: user.failedLoginAttempts,
    lockedUntil: user.lockedUntil?.toISOString() ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    passwordChangedAt: user.passwordChangedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function writeUserAuditLog(
  transaction: Prisma.TransactionClient,
  input: AuditWriteInput,
): Promise<void> {
  await transaction.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: "User",
      entityId: input.entityId,
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
      ...(input.oldValue === undefined
        ? {}
        : {
            oldValue: input.oldValue,
          }),
      ...(input.newValue === undefined
        ? {}
        : {
            newValue: input.newValue,
          }),
    },
  });
}

function revalidateUserPages(): void {
  revalidatePath(USER_ROUTE);
  revalidatePath(AUDIT_ROUTE);
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
}

function redirectWithStatus(
  status: "notice" | "error",
  message: string,
): never {
  const search = new URLSearchParams({
    [status]: message,
  });

  redirect(`${USER_ROUTE}?${search.toString()}`);
}

export async function createUserAction(formData: FormData): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    role: formData.get("role"),
    temporaryPassword: formData.get("temporaryPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  try {
    const passwordHash = await hashPassword(parsed.data.temporaryPassword);

    const createdUser = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: parsed.data.name,
          username: parsed.data.username,
          email: parsed.data.email,
          role: parsed.data.role as UserRole,
          passwordHash,
          isActive: true,
          mustChangePassword: true,
        },
        select: auditUserSelect,
      });

      await writeUserAuditLog(transaction, {
        actorId: actor.user.id,
        action: "USER_CREATED",
        entityId: user.id,
        context,
        newValue: toAuditUser(user),
      });

      return user;
    });

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      `Pengguna ${createdUser.name} berhasil ditambahkan.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    if (isUniqueConstraintError(error)) {
      redirectWithStatus(
        "error",
        "Username atau email sudah digunakan oleh pengguna lain.",
      );
    }

    reportActionError("Pembuatan pengguna gagal.", error);
    redirectWithStatus("error", "Pengguna tidak dapat ditambahkan.");
  }
}

export async function updateUserAction(formData: FormData): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  if (
    actor.user.id === parsed.data.userId &&
    parsed.data.role !== UserRole.SUPER_ADMIN
  ) {
    redirectWithStatus(
      "error",
      "Role akun yang sedang digunakan tidak dapat diturunkan.",
    );
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const current = await transaction.user.findUnique({
          where: {
            id: parsed.data.userId,
          },
          select: auditUserSelect,
        });

        if (!current) {
          return {
            type: "not-found" as const,
          };
        }

        if (
          current.role === UserRole.SUPER_ADMIN &&
          current.isActive &&
          parsed.data.role !== UserRole.SUPER_ADMIN
        ) {
          const activeSuperAdminCount = await transaction.user.count({
            where: {
              role: UserRole.SUPER_ADMIN,
              isActive: true,
            },
          });

          if (activeSuperAdminCount <= 1) {
            return {
              type: "last-super-admin" as const,
            };
          }
        }

        const updated = await transaction.user.update({
          where: {
            id: current.id,
          },
          data: {
            name: parsed.data.name,
            username: parsed.data.username,
            email: parsed.data.email,
            role: parsed.data.role as UserRole,
          },
          select: auditUserSelect,
        });

        let revokedSessionCount = 0;

        if (current.role !== updated.role) {
          const deletedSessions = await transaction.userSession.deleteMany({
            where: {
              userId: updated.id,
            },
          });

          revokedSessionCount = deletedSessions.count;
        }

        await writeUserAuditLog(transaction, {
          actorId: actor.user.id,
          action: "USER_UPDATED",
          entityId: updated.id,
          context,
          oldValue: toAuditUser(current),
          newValue: {
            ...toAuditUser(updated),
            revokedSessionCount,
          },
        });

        return {
          type: "updated" as const,
          user: updated,
          revokedSessionCount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if (result.type === "not-found") {
      redirectWithStatus("error", "Pengguna tidak ditemukan.");
    }

    if (result.type === "last-super-admin") {
      redirectWithStatus(
        "error",
        "Super admin aktif terakhir tidak dapat diturunkan rolenya.",
      );
    }

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      result.revokedSessionCount > 0
        ? `Pengguna ${result.user.name} diperbarui dan ${result.revokedSessionCount} sesi dicabut.`
        : `Pengguna ${result.user.name} berhasil diperbarui.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    if (isUniqueConstraintError(error)) {
      redirectWithStatus(
        "error",
        "Username atau email sudah digunakan oleh pengguna lain.",
      );
    }

    reportActionError("Pembaruan pengguna gagal.", error);
    redirectWithStatus("error", "Pengguna tidak dapat diperbarui.");
  }
}

export async function changeUserStatusAction(
  formData: FormData,
): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = changeUserStatusSchema.safeParse({
    userId: formData.get("userId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  if (actor.user.id === parsed.data.userId && !parsed.data.isActive) {
    redirectWithStatus(
      "error",
      "Akun yang sedang digunakan tidak dapat dinonaktifkan.",
    );
  }

  try {
    const result = await prisma.$transaction(
      async (transaction) => {
        const current = await transaction.user.findUnique({
          where: {
            id: parsed.data.userId,
          },
          select: auditUserSelect,
        });

        if (!current) {
          return {
            type: "not-found" as const,
          };
        }

        if (current.isActive === parsed.data.isActive) {
          return {
            type: "unchanged" as const,
            user: current,
          };
        }

        if (!parsed.data.isActive && current.role === UserRole.SUPER_ADMIN) {
          const activeSuperAdminCount = await transaction.user.count({
            where: {
              role: UserRole.SUPER_ADMIN,
              isActive: true,
            },
          });

          if (activeSuperAdminCount <= 1) {
            return {
              type: "last-super-admin" as const,
            };
          }
        }

        const updated = await transaction.user.update({
          where: {
            id: current.id,
          },
          data: {
            isActive: parsed.data.isActive,
            ...(parsed.data.isActive
              ? {
                  failedLoginAttempts: 0,
                  lockedUntil: null,
                }
              : {}),
          },
          select: auditUserSelect,
        });

        let revokedSessionCount = 0;

        if (!updated.isActive) {
          const deletedSessions = await transaction.userSession.deleteMany({
            where: {
              userId: updated.id,
            },
          });

          revokedSessionCount = deletedSessions.count;
        }

        await writeUserAuditLog(transaction, {
          actorId: actor.user.id,
          action: updated.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
          entityId: updated.id,
          context,
          oldValue: toAuditUser(current),
          newValue: {
            ...toAuditUser(updated),
            revokedSessionCount,
          },
        });

        return {
          type: "updated" as const,
          user: updated,
          revokedSessionCount,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if (result.type === "not-found") {
      redirectWithStatus("error", "Pengguna tidak ditemukan.");
    }

    if (result.type === "last-super-admin") {
      redirectWithStatus(
        "error",
        "Super admin aktif terakhir tidak dapat dinonaktifkan.",
      );
    }

    if (result.type === "unchanged") {
      redirectWithStatus("notice", "Status pengguna tidak berubah.");
    }

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      result.user.isActive
        ? `Pengguna ${result.user.name} berhasil diaktifkan.`
        : `Pengguna ${result.user.name} dinonaktifkan dan ${result.revokedSessionCount} sesi dicabut.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    reportActionError("Perubahan status pengguna gagal.", error);
    redirectWithStatus("error", "Status pengguna tidak dapat diubah.");
  }
}

export async function resetUserPasswordAction(
  formData: FormData,
): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = resetUserPasswordSchema.safeParse({
    userId: formData.get("userId"),
    temporaryPassword: formData.get("temporaryPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  if (actor.user.id === parsed.data.userId) {
    redirectWithStatus(
      "error",
      "Gunakan menu ubah password untuk akun yang sedang digunakan.",
    );
  }

  try {
    const passwordHash = await hashPassword(parsed.data.temporaryPassword);
    const changedAt = new Date();

    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.user.findUnique({
        where: {
          id: parsed.data.userId,
        },
        select: auditUserSelect,
      });

      if (!current) {
        return {
          type: "not-found" as const,
        };
      }

      const updated = await transaction.user.update({
        where: {
          id: current.id,
        },
        data: {
          passwordHash,
          mustChangePassword: true,
          passwordChangedAt: changedAt,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
        select: auditUserSelect,
      });

      const deletedSessions = await transaction.userSession.deleteMany({
        where: {
          userId: updated.id,
        },
      });

      await writeUserAuditLog(transaction, {
        actorId: actor.user.id,
        action: "USER_PASSWORD_RESET",
        entityId: updated.id,
        context,
        oldValue: {
          mustChangePassword: current.mustChangePassword,
          passwordChangedAt: current.passwordChangedAt?.toISOString() ?? null,
          failedLoginAttempts: current.failedLoginAttempts,
          lockedUntil: current.lockedUntil?.toISOString() ?? null,
        },
        newValue: {
          mustChangePassword: updated.mustChangePassword,
          passwordChangedAt: updated.passwordChangedAt?.toISOString() ?? null,
          failedLoginAttempts: updated.failedLoginAttempts,
          lockedUntil: updated.lockedUntil?.toISOString() ?? null,
          revokedSessionCount: deletedSessions.count,
        },
      });

      return {
        type: "updated" as const,
        user: updated,
        revokedSessionCount: deletedSessions.count,
      };
    });

    if (result.type === "not-found") {
      redirectWithStatus("error", "Pengguna tidak ditemukan.");
    }

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      `Password ${result.user.name} berhasil direset. ${result.revokedSessionCount} sesi dicabut.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    reportActionError("Reset password pengguna gagal.", error);
    redirectWithStatus("error", "Password pengguna tidak dapat direset.");
  }
}

export async function unlockUserAction(formData: FormData): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const current = await transaction.user.findUnique({
        where: {
          id: parsed.data.userId,
        },
        select: auditUserSelect,
      });

      if (!current) {
        return {
          type: "not-found" as const,
        };
      }

      const updated = await transaction.user.update({
        where: {
          id: current.id,
        },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
        select: auditUserSelect,
      });

      await writeUserAuditLog(transaction, {
        actorId: actor.user.id,
        action: "USER_UNLOCKED",
        entityId: updated.id,
        context,
        oldValue: {
          failedLoginAttempts: current.failedLoginAttempts,
          lockedUntil: current.lockedUntil?.toISOString() ?? null,
        },
        newValue: {
          failedLoginAttempts: updated.failedLoginAttempts,
          lockedUntil: updated.lockedUntil?.toISOString() ?? null,
        },
      });

      return {
        type: "updated" as const,
        user: updated,
      };
    });

    if (result.type === "not-found") {
      redirectWithStatus("error", "Pengguna tidak ditemukan.");
    }

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      `Kunci akun ${result.user.name} berhasil dibuka.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    reportActionError("Pembukaan kunci pengguna gagal.", error);
    redirectWithStatus("error", "Kunci akun tidak dapat dibuka.");
  }
}

export async function revokeUserSessionsAction(
  formData: FormData,
): Promise<never> {
  const actor = await requireAdminRole(superAdminOnly);
  const context = await getAuditRequestContext();

  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirectWithStatus("error", firstIssueMessage(parsed.error));
  }

  if (actor.user.id === parsed.data.userId) {
    redirectWithStatus(
      "error",
      "Gunakan tombol keluar untuk mengakhiri sesi akun sendiri.",
    );
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: {
          id: parsed.data.userId,
        },
        select: auditUserSelect,
      });

      if (!user) {
        return {
          type: "not-found" as const,
        };
      }

      const deletedSessions = await transaction.userSession.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await writeUserAuditLog(transaction, {
        actorId: actor.user.id,
        action: "USER_SESSIONS_REVOKED",
        entityId: user.id,
        context,
        newValue: {
          revokedSessionCount: deletedSessions.count,
        },
      });

      return {
        type: "revoked" as const,
        user,
        revokedSessionCount: deletedSessions.count,
      };
    });

    if (result.type === "not-found") {
      redirectWithStatus("error", "Pengguna tidak ditemukan.");
    }

    revalidateUserPages();

    redirectWithStatus(
      "notice",
      `${result.revokedSessionCount} sesi ${result.user.name} berhasil dicabut.`,
    );
  } catch (error: unknown) {
    unstable_rethrow(error);
    reportActionError("Pencabutan sesi pengguna gagal.", error);
    redirectWithStatus("error", "Sesi pengguna tidak dapat dicabut.");
  }
}
