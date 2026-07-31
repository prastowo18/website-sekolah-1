import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import type { Metadata } from "next";
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
import { SocialLinkFormDialog } from "@/features/social-link/components/social-link-form-dialog";
import { SocialLinkTable } from "@/features/social-link/components/social-link-table";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Media Sosial | Panel Administrasi",
  description: "Kelola tautan media sosial resmi sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  platform?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type StatusFilter = "all" | "active" | "inactive";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): StatusFilter {
  if (value === "active" || value === "inactive") {
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
  platform,
  status,
  page,
}: {
  q: string;
  platform: string;
  status: StatusFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (platform) {
    parameters.set("platform", platform);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query
    ? `/konsol-8m4q7x2k9v6d/media-sosial?${query}`
    : "/konsol-8m4q7x2k9v6d/media-sosial";
}

export default async function SocialLinkPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();

  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedPlatform = firstValue(parameters.platform)
    .trim()
    .toUpperCase()
    .slice(0, 50);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const platformRecords = await prisma.socialLink.findMany({
    distinct: ["platform"],
    orderBy: {
      platform: "asc",
    },
    select: {
      platform: true,
    },
  });

  const platformOptions = platformRecords.map((record) => record.platform);

  const platform = platformOptions.includes(requestedPlatform)
    ? requestedPlatform
    : "";

  const where: Prisma.SocialLinkWhereInput = {};

  if (q) {
    where.OR = [
      {
        platform: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        label: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        url: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (platform) {
    where.platform = platform;
  }

  if (status === "active") {
    where.isActive = true;
  }

  if (status === "inactive") {
    where.isActive = false;
  }

  const total = await prisma.socialLink.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const socialLinks = await prisma.socialLink.findMany({
    where,
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        platform: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      platform: true,
      label: true,
      url: true,
      icon: true,
      isActive: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serialized = socialLinks.map((socialLink) => ({
    ...socialLink,
    createdAt: socialLink.createdAt.toISOString(),
    updatedAt: socialLink.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Media Sosial
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola akun dan kanal resmi yang ditampilkan pada website sekolah.
          </p>
        </div>

        {canEdit ? <SocialLinkFormDialog /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_220px_180px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari platform, label, atau URL..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="platform" defaultValue={platform || "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua platform" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua platform</SelectItem>

                {platformOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
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

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || platform || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/konsol-8m4q7x2k9v6d/media-sosial">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <SocialLinkTable socialLinks={serialized} canEdit={canEdit} />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} media sosial.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  platform,
                  status,
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
                  platform,
                  status,
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
