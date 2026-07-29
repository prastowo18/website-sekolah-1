"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { changePasswordAction } from "@/features/auth/change-password-actions";
import { initialChangePasswordActionState } from "@/features/auth/change-password-types";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialChangePasswordActionState,
  );

  const currentPasswordError = state.fieldErrors?.currentPassword?.[0];

  const newPasswordError = state.fieldErrors?.newPassword?.[0];

  const confirmPasswordError = state.fieldErrors?.confirmPassword?.[0];

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === "error" && state.message ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Password saat ini</Label>

        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password saat ini"
          disabled={isPending}
          aria-invalid={Boolean(currentPasswordError)}
          aria-describedby={
            currentPasswordError ? "current-password-error" : undefined
          }
          autoFocus
          required
        />

        {currentPasswordError ? (
          <p id="current-password-error" className="text-sm text-destructive">
            {currentPasswordError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Password baru</Label>

        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 12 karakter"
          disabled={isPending}
          aria-invalid={Boolean(newPasswordError)}
          aria-describedby={
            newPasswordError ? "new-password-error" : "new-password-help"
          }
          required
        />

        {newPasswordError ? (
          <p id="new-password-error" className="text-sm text-destructive">
            {newPasswordError}
          </p>
        ) : (
          <p id="new-password-help" className="text-xs text-muted-foreground">
            Gunakan minimal 12 karakter dan jangan gunakan password lama.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi password baru</Label>

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi password baru"
          disabled={isPending}
          aria-invalid={Boolean(confirmPasswordError)}
          aria-describedby={
            confirmPasswordError ? "confirm-password-error" : undefined
          }
          required
        />

        {confirmPasswordError ? (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {confirmPasswordError}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner data-icon="inline-start" />
            Menyimpan...
          </>
        ) : (
          "Simpan password baru"
        )}
      </Button>
    </form>
  );
}
