import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnouncementFormDialog } from "@/features/announcement/components/announcement-form-dialog";
import { AnnouncementTable } from "@/features/announcement/components/announcement-table";
import {
  announcementPriorities,
  announcementPriorityLabels,
  type AnnouncementPriorityValue,
} from "@/features/announcement/constants";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Pengumuman | Panel Administrasi",
  description: "Kelola pengumuman sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  priority?: string | string[];
  status?: string | string[];
  pin?: string | string[];
  page?: string | string[];
};

type PriorityFilter = "all" | AnnouncementPriorityValue;

type StatusFilter = "all" | "active" | "inactive";

type PinFilter = "all" | "pinned" | "unpinned";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePriority(value: string): PriorityFilter {
  return announcementPriorities.includes(value as AnnouncementPriorityValue)
    ? (value as AnnouncementPriorityValue)
    : "all";
}

function normalizeStatus(value: string): StatusFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizePin(value: string): PinFilter {
  if (value === "pinned" || value === "unpinned") {
    return value;
  }

  return "all";
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  q,
  priority,
  status,
  pin,
  page,
}: {
  q: string;
  priority: PriorityFilter;
  status: StatusFilter;
  pin: PinFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (priority !== "all") {
    parameters.set("priority", priority);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (pin !== "all") {
    parameters.set("pin", pin);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/admin/pengumuman?${query}` : "/admin/pengumuman";
}

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const priority = normalizePriority(firstValue(parameters.priority));

  const status = normalizeStatus(firstValue(parameters.status));

  const pin = normalizePin(firstValue(parameters.pin));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const where: Prisma.AnnouncementWhereInput = {};

  if (q) {
    where.OR = [
      {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (priority !== "all") {
    where.priority = priority;
  }

  if (status === "active") {
    where.isActive = true;
  }

  if (status === "inactive") {
    where.isActive = false;
  }

  if (pin === "pinned") {
    where.isPinned = true;
  }

  if (pin === "unpinned") {
    where.isPinned = false;
  }

  const total = await prisma.announcement.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: [
      {
        isPinned: "desc",
      },
      {
        startDate: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      priority: true,
      attachmentUrl: true,
      startDate: true,
      endDate: true,
      isPinned: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serialized = announcements.map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    slug: announcement.slug,
    content: announcement.content,
    priority: announcement.priority,
    attachmentUrl: announcement.attachmentUrl,
    startDate: announcement.startDate?.toISOString() ?? null,
    endDate: announcement.endDate?.toISOString() ?? null,
    isPinned: announcement.isPinned,
    isActive: announcement.isActive,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pengumuman
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pengumuman, prioritas, periode tayang, dan lampiran.
          </p>
        </div>

        {canEdit ? <AnnouncementFormDialog /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_170px_170px_170px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, isi, atau slug..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="priority" defaultValue={priority}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua prioritas" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua prioritas</SelectItem>

                {announcementPriorities.map((item) => (
                  <SelectItem key={item} value={item}>
                    {announcementPriorityLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>

                <SelectItem value="active">Aktif</SelectItem>

                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Select name="pin" defaultValue={pin}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua pin" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua pengumuman</SelectItem>

                <SelectItem value="pinned">Disematkan</SelectItem>

                <SelectItem value="unpinned">Tidak disematkan</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || priority !== "all" || status !== "all" || pin !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/admin/pengumuman">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <AnnouncementTable announcements={serialized} canEdit={canEdit} />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} pengumuman.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  priority,
                  status,
                  pin,
                  page: currentPage - 1,
                })}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="size-4" />
              Sebelumnya
            </Button>
          )}

          <span className="min-w-24 text-center">
            Halaman {currentPage} dari {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  priority,
                  status,
                  pin,
                  page: currentPage + 1,
                })}
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Berikutnya
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
