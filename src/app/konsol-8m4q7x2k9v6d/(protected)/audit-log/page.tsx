import { Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 25;
const superAdminOnly = [UserRole.SUPER_ADMIN] as const;

const sensitiveKeyPattern =
  /(password|passwordhash|token|secret|credential|accesskey|privatekey|cookie|authorization)/i;

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchValue(searchParams: SearchParams, key: string): string {
  const value = searchParams[key];

  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function parseStartDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000+07:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseEndDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T23:59:59.999+07:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function redactAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactAuditValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveKeyPattern.test(key)
          ? "[REDACTED]"
          : redactAuditValue(nestedValue),
      ]),
    );
  }

  return value;
}

function formatAuditValue(value: Prisma.JsonValue | null): string {
  if (value === null) {
    return "—";
  }

  return JSON.stringify(redactAuditValue(value), null, 2);
}

function pageHref(searchParams: SearchParams, page: number): string {
  const params = new URLSearchParams();

  for (const key of ["q", "actorId", "action", "entity", "from", "to"]) {
    const value = getSearchValue(searchParams, key);

    if (value) {
      params.set(key, value);
    }
  }

  params.set("page", String(page));

  return `/konsol-8m4q7x2k9v6d/audit-log?${params.toString()}`;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminRole(superAdminOnly);

  const resolvedSearchParams = await searchParams;

  const q = getSearchValue(resolvedSearchParams, "q").trim();
  const actorId = getSearchValue(resolvedSearchParams, "actorId");
  const action = getSearchValue(resolvedSearchParams, "action");
  const entity = getSearchValue(resolvedSearchParams, "entity");
  const from = getSearchValue(resolvedSearchParams, "from");
  const to = getSearchValue(resolvedSearchParams, "to");
  const page = parsePage(getSearchValue(resolvedSearchParams, "page"));

  const filters: Prisma.AuditLogWhereInput[] = [];

  if (q) {
    filters.push({
      OR: [
        {
          action: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          entity: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          entityId: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          actor: {
            is: {
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
              ],
            },
          },
        },
      ],
    });
  }

  if (actorId) {
    filters.push({
      actorId,
    });
  }

  if (action) {
    filters.push({
      action,
    });
  }

  if (entity) {
    filters.push({
      entity,
    });
  }

  const startDate = parseStartDate(from);
  const endDate = parseEndDate(to);

  if (startDate || endDate) {
    filters.push({
      createdAt: {
        ...(startDate
          ? {
              gte: startDate,
            }
          : {}),
        ...(endDate
          ? {
              lte: endDate,
            }
          : {}),
      },
    });
  }

  const where: Prisma.AuditLogWhereInput =
    filters.length > 0
      ? {
          AND: filters,
        }
      : {};

  const [logs, totalLogs, actors, actionOptions, entityOptions] =
    await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              username: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({
        where,
      }),
      prisma.user.findMany({
        where: {
          auditLogs: {
            some: {},
          },
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          username: true,
        },
      }),
      prisma.auditLog.findMany({
        distinct: ["action"],
        orderBy: {
          action: "asc",
        },
        select: {
          action: true,
        },
      }),
      prisma.auditLog.findMany({
        distinct: ["entity"],
        orderBy: {
          entity: "asc",
        },
        select: {
          entity: true,
        },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalLogs / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />

          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Riwayat aktivitas administrasi. Data pada halaman ini hanya dapat
          dibaca.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter aktivitas</CardTitle>

          <CardDescription>
            Cari berdasarkan pengguna, tindakan, entitas, ID, atau rentang
            tanggal.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            method="get"
            className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"
          >
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari aktivitas"
                className="pl-9"
              />
            </div>

            <select
              name="actorId"
              defaultValue={actorId}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Semua pengguna</option>

              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name} (@{actor.username})
                </option>
              ))}
            </select>

            <select
              name="action"
              defaultValue={action}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Semua tindakan</option>

              {actionOptions.map((item) => (
                <option key={item.action} value={item.action}>
                  {item.action}
                </option>
              ))}
            </select>

            <select
              name="entity"
              defaultValue={entity}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">Semua entitas</option>

              {entityOptions.map((item) => (
                <option key={item.entity} value={item.entity}>
                  {item.entity}
                </option>
              ))}
            </select>

            <Button type="submit" variant="outline">
              Terapkan
            </Button>

            <Input
              type="date"
              name="from"
              defaultValue={from}
              aria-label="Tanggal mulai"
            />

            <Input
              type="date"
              name="to"
              defaultValue={to}
              aria-label="Tanggal akhir"
            />

            <Button type="button" variant="ghost" asChild>
              <Link href="/konsol-8m4q7x2k9v6d/audit-log">
                Bersihkan filter
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas</CardTitle>

          <CardDescription>{totalLogs} catatan sesuai filter.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Tindakan</TableHead>
                  <TableHead>Entitas</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead className="w-[120px]">Detail</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="min-w-48 align-top">
                        {formatDate(log.createdAt)}
                      </TableCell>

                      <TableCell className="min-w-52 align-top">
                        {log.actor ? (
                          <>
                            <div className="font-medium">{log.actor.name}</div>

                            <div className="text-xs text-muted-foreground">
                              @{log.actor.username} · {log.actor.role}
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            Sistem / pengguna terhapus
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>

                      <TableCell className="min-w-48 align-top">
                        <div className="font-medium">{log.entity}</div>

                        <div className="break-all text-xs text-muted-foreground">
                          {log.entityId || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="min-w-64 align-top text-xs">
                        <div>IP: {log.ipAddress || "Tidak tersedia"}</div>

                        <div className="mt-1 break-words text-muted-foreground">
                          {log.userAgent || "User agent tidak tersedia"}
                        </div>
                      </TableCell>

                      <TableCell className="align-top">
                        <details>
                          <summary className="cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium hover:bg-muted">
                            Buka
                          </summary>

                          <div className="mt-3 w-[min(78vw,720px)] space-y-4 rounded-lg border bg-card p-4 shadow-lg">
                            <div>
                              <p className="mb-2 font-medium">Sebelum</p>

                              <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
                                {formatAuditValue(log.oldValue)}
                              </pre>
                            </div>

                            <div>
                              <p className="mb-2 font-medium">Sesudah</p>

                              <pre className="max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
                                {formatAuditValue(log.newValue)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-muted-foreground"
                    >
                      Tidak ada audit log yang sesuai.
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
                <Link
                  href={
                    page <= 1
                      ? pageHref(resolvedSearchParams, 1)
                      : pageHref(resolvedSearchParams, page - 1)
                  }
                  aria-disabled={page <= 1}
                >
                  Sebelumnya
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={page >= totalPages}
              >
                <Link
                  href={
                    page >= totalPages
                      ? pageHref(resolvedSearchParams, totalPages)
                      : pageHref(resolvedSearchParams, page + 1)
                  }
                  aria-disabled={page >= totalPages}
                >
                  Berikutnya
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
