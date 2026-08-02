import { Search, UserPlus, Users } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma, UserRole } from "@/generated/prisma/client";
import { UserManageDialog } from "@/features/user-management/components/user-manage-dialog";
import { createUserAction } from "@/features/user-management/actions";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;
const superAdminOnly = [UserRole.SUPER_ADMIN] as const;

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_ADMIN: "Admin Konten",
  VIEWER: "Viewer",
};

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchValue(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];

  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseRole(value: string): UserRole | undefined {
  return Object.values(UserRole).includes(value as UserRole)
    ? (value as UserRole)
    : undefined;
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function pageHref(searchParams: SearchParams, page: number): string {
  const params = new URLSearchParams();

  for (const key of ["q", "role", "status"]) {
    const value = getSearchValue(searchParams, key);

    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));

  return `/konsol-8m4q7x2k9v6d/pengguna?${params.toString()}`;
}

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminRole(superAdminOnly);
  const resolvedSearchParams = await searchParams;

  const q = getSearchValue(resolvedSearchParams, "q").trim();
  const role = parseRole(getSearchValue(resolvedSearchParams, "role"));
  const status = getSearchValue(resolvedSearchParams, "status");
  const notice = getSearchValue(resolvedSearchParams, "notice");
  const error = getSearchValue(resolvedSearchParams, "error");
  const page = parsePage(getSearchValue(resolvedSearchParams, "page"));

  const requestNow = new Date();

  const filters: Prisma.UserWhereInput[] = [];

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
          username: {
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
      ],
    });
  }

  if (role) {
    filters.push({
      role,
    });
  }

  if (status === "active") {
    filters.push({
      isActive: true,
    });
  } else if (status === "inactive") {
    filters.push({
      isActive: false,
    });
  } else if (status === "locked") {
    filters.push({
      lockedUntil: {
        gt: new Date(),
      },
    });
  }

  const where: Prisma.UserWhereInput =
    filters.length > 0
      ? {
          AND: filters,
        }
      : {};

  const [users, totalUsers, activeUsers, lockedUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [
        {
          isActive: "desc",
        },
        {
          name: "asc",
        },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
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
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    }),
    prisma.user.count({
      where,
    }),
    prisma.user.count({
      where: {
        isActive: true,
      },
    }),
    prisma.user.count({
      where: {
        lockedUntil: {
          gt: new Date(),
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="size-6 text-primary" />

          <h1 className="text-2xl font-bold tracking-tight">Pengguna</h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola akun, role, status, password, dan sesi administrator.
        </p>
      </div>

      {notice ? (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total sesuai filter</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pengguna aktif</CardDescription>
            <CardTitle className="text-3xl">{activeUsers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Akun terkunci</CardDescription>
            <CardTitle className="text-3xl">{lockedUsers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            <CardTitle>Tambah pengguna</CardTitle>
          </div>

          <CardDescription>
            Pengguna baru wajib mengganti password sementara saat login.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={createUserAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nama</Label>
              <Input id="create-name" name="name" maxLength={120} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-username">Username</Label>
              <Input
                id="create-username"
                name="username"
                maxLength={50}
                autoCapitalize="none"
                spellCheck={false}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                name="email"
                type="email"
                maxLength={180}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <select
                id="create-role"
                name="role"
                defaultValue={UserRole.CONTENT_ADMIN}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Object.values(UserRole).map((item) => (
                  <option key={item} value={item}>
                    {roleLabels[item]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Password sementara</Label>
              <Input
                id="create-password"
                name="temporaryPassword"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-confirm-password">
                Konfirmasi password
              </Label>
              <Input
                id="create-confirm-password"
                name="confirmPassword"
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit">
                <UserPlus />
                Tambah pengguna
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar pengguna</CardTitle>

          <CardDescription>
            Gunakan pencarian dan filter untuk menemukan akun.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            method="get"
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari nama, username, atau email"
                className="pl-9"
              />
            </div>

            <select
              name="role"
              defaultValue={role ?? ""}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
            >
              <option value="">Semua role</option>

              {Object.values(UserRole).map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={status}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
            >
              <option value="">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="locked">Terkunci</option>
            </select>

            <Button type="submit" variant="outline">
              Terapkan
            </Button>
          </form>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Login dan sesi</TableHead>
                  <TableHead className="w-[150px]">Tindakan</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => {
                    const isCurrentUser = user.id === session.user.id;

                    const isLocked =
                      user.lockedUntil !== null &&
                      user.lockedUntil.getTime() > requestNow.getTime();

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="min-w-64">
                          <div className="font-medium">
                            {user.name}
                            {isCurrentUser ? (
                              <span className="ml-2 text-xs text-muted-foreground">
                                akun anda
                              </span>
                            ) : null}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            @{user.username}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {user.email || "Tanpa email"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>

                        <TableCell className="space-y-1">
                          <div>
                            <Badge
                              variant={
                                user.isActive ? "secondary" : "destructive"
                              }
                            >
                              {user.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>

                          {isLocked ? (
                            <Badge variant="destructive">Terkunci</Badge>
                          ) : null}

                          {user.mustChangePassword ? (
                            <div className="text-xs text-muted-foreground">
                              Wajib ganti password
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell className="min-w-52 text-sm">
                          <div>
                            Login terakhir: {formatDate(user.lastLoginAt)}
                          </div>

                          <div>Sesi aktif: {user._count.sessions}</div>

                          <div className="text-xs text-muted-foreground">
                            Dibuat {formatDate(user.createdAt)}
                          </div>
                        </TableCell>

                        <TableCell className="w-[132px] whitespace-nowrap align-top">
                          <UserManageDialog
                            user={{
                              id: user.id,
                              name: user.name,
                              username: user.username,
                              email: user.email,
                              role: user.role,
                              isActive: user.isActive,
                              failedLoginAttempts: user.failedLoginAttempts,
                              sessionCount: user._count.sessions,
                            }}
                            isCurrentUser={isCurrentUser}
                            isLocked={isLocked}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-muted-foreground"
                    >
                      Tidak ada pengguna yang sesuai.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild disabled={page <= 1}>
                <a
                  href={
                    page <= 1
                      ? pageHref(resolvedSearchParams, 1)
                      : pageHref(resolvedSearchParams, page - 1)
                  }
                  aria-disabled={page <= 1}
                >
                  Sebelumnya
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={page >= totalPages}
              >
                <a
                  href={
                    page >= totalPages
                      ? pageHref(resolvedSearchParams, totalPages)
                      : pageHref(resolvedSearchParams, page + 1)
                  }
                  aria-disabled={page >= totalPages}
                >
                  Berikutnya
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
