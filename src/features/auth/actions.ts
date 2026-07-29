"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

import {
  ACCOUNT_LOCKED_MESSAGE,
  DUMMY_PASSWORD_HASH,
  INVALID_CREDENTIAL_MESSAGE,
  LOGIN_LOCK_DURATION_MS,
  MAX_FAILED_LOGIN_ATTEMPTS,
} from "./config";
import { loginSchema } from "./schemas";
import type { AuthActionState } from "./types";

type LoginDestination =
  "/konsol-8m4q7x2k9v6d/dashboard" | "/konsol-8m4q7x2k9v6d/ubah-password";

async function recordFailedLogin(
  userId: string,
  currentAttempts: number,
): Promise<void> {
  const nextAttempts = currentAttempts + 1;
  const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      failedLoginAttempts: shouldLock ? 0 : nextAttempts,
      lockedUntil: shouldLock
        ? new Date(Date.now() + LOGIN_LOCK_DURATION_MS)
        : null,
    },
  });
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;

    return {
      status: "error",
      message: "Periksa kembali data login.",
      fieldErrors: {
        identifier: errors.identifier,
        password: errors.password,
      },
    };
  }

  const { identifier, password } = parsed.data;
  const now = new Date();

  let destination: LoginDestination;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username: identifier,
          },
          {
            email: identifier,
          },
        ],
      },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
        mustChangePassword: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    const passwordIsValid = await verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    const accountIsLocked =
      user?.lockedUntil && user.lockedUntil.getTime() > now.getTime();

    if (accountIsLocked) {
      return {
        status: "error",
        message: ACCOUNT_LOCKED_MESSAGE,
      };
    }

    if (!user || !user.isActive || !passwordIsValid) {
      if (user?.isActive) {
        await recordFailedLogin(user.id, user.failedLoginAttempts);
      }

      return {
        status: "error",
        message: INVALID_CREDENTIAL_MESSAGE,
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
      },
    });

    await createSession(user.id);

    destination = user.mustChangePassword
      ? "/konsol-8m4q7x2k9v6d/ubah-password"
      : "/konsol-8m4q7x2k9v6d/dashboard";
  } catch (error: unknown) {
    console.error("Proses login gagal.", error);

    return {
      status: "error",
      message: "Terjadi gangguan pada server. Silakan coba kembali.",
    };
  }

  redirect(destination);
}
