"use client";

import { KeyRound, LockKeyholeOpen, ShieldCheck, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changeUserStatusAction,
  resetUserPasswordAction,
  revokeUserSessionsAction,
  unlockUserAction,
  updateUserAction,
} from "@/features/user-management/actions";

type UserRoleValue = "SUPER_ADMIN" | "CONTENT_ADMIN" | "VIEWER";

type UserManageDialogProps = {
  user: {
    id: string;
    name: string;
    username: string;
    email: string | null;
    role: UserRoleValue;
    isActive: boolean;
    failedLoginAttempts: number;
    sessionCount: number;
  };
  isCurrentUser: boolean;
  isLocked: boolean;
};

const roleLabels: Record<UserRoleValue, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_ADMIN: "Admin Konten",
  VIEWER: "Viewer",
};

const roles = Object.keys(roleLabels) as UserRoleValue[];

export function UserManageDialog({
  user,
  isCurrentUser,
  isLocked,
}: UserManageDialogProps) {
  const canManageSensitiveActions = !isCurrentUser;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full whitespace-nowrap"
        >
          <UserCog />
          Kelola
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Kelola pengguna</DialogTitle>

          <DialogDescription>
            Ubah identitas, role, status akun, password, dan sesi pengguna.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-4">
            <div>
              <h3 className="font-semibold">Informasi pengguna</h3>

              <p className="text-sm text-muted-foreground">
                Perubahan role atau status akan mencabut sesi pengguna terkait.
              </p>
            </div>

            <form action={updateUserAction} className="space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`name-${user.id}`}>Nama</Label>

                  <Input
                    id={`name-${user.id}`}
                    name="name"
                    defaultValue={user.name}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`username-${user.id}`}>Username</Label>

                  <Input
                    id={`username-${user.id}`}
                    name="username"
                    defaultValue={user.username}
                    maxLength={50}
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`email-${user.id}`}>Email</Label>

                <Input
                  id={`email-${user.id}`}
                  name="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  maxLength={180}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`role-${user.id}`}>Role</Label>

                <select
                  id={`role-${user.id}`}
                  name="role"
                  defaultValue={user.role}
                  disabled={isCurrentUser}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>

                {isCurrentUser ? (
                  <input type="hidden" name="role" value={user.role} />
                ) : null}
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Simpan perubahan
              </Button>
            </form>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-semibold">Status akun</h3>

              <p className="text-sm text-muted-foreground">
                Akun yang sedang digunakan tidak dapat dinonaktifkan.
              </p>
            </div>

            <form action={changeUserStatusAction}>
              <input type="hidden" name="userId" value={user.id} />

              <input
                type="hidden"
                name="isActive"
                value={user.isActive ? "false" : "true"}
              />

              <Button
                type="submit"
                variant={user.isActive ? "destructive" : "outline"}
                disabled={!canManageSensitiveActions}
                className="w-full sm:w-auto"
              >
                {user.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
              </Button>
            </form>

            {isLocked || user.failedLoginAttempts > 0 ? (
              <form action={unlockUserAction}>
                <input type="hidden" name="userId" value={user.id} />

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <LockKeyholeOpen />
                  Reset kunci login
                </Button>
              </form>
            ) : null}
          </section>

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <KeyRound className="size-4" />
                Reset password
              </h3>

              <p className="text-sm text-muted-foreground">
                Pengguna wajib mengganti password sementara saat login
                berikutnya.
              </p>
            </div>

            <form action={resetUserPasswordAction} className="space-y-4">
              <input type="hidden" name="userId" value={user.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`temporary-password-${user.id}`}>
                    Password sementara
                  </Label>

                  <Input
                    id={`temporary-password-${user.id}`}
                    name="temporaryPassword"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={!canManageSensitiveActions}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`confirm-password-${user.id}`}>
                    Konfirmasi password
                  </Label>

                  <Input
                    id={`confirm-password-${user.id}`}
                    name="confirmPassword"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                    disabled={!canManageSensitiveActions}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={!canManageSensitiveActions}
                className="w-full sm:w-auto"
              >
                Reset password
              </Button>
            </form>
          </section>

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4" />
                Sesi pengguna
              </h3>

              <p className="text-sm text-muted-foreground">
                Sesi aktif saat ini: {user.sessionCount}.
              </p>
            </div>

            <form action={revokeUserSessionsAction}>
              <input type="hidden" name="userId" value={user.id} />

              <Button
                type="submit"
                variant="outline"
                disabled={!canManageSensitiveActions || user.sessionCount === 0}
                className="w-full sm:w-auto"
              >
                <ShieldCheck />
                Cabut semua sesi
              </Button>
            </form>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
