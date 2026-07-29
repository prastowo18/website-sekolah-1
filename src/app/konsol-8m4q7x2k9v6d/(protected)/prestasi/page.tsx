import type { Metadata } from "next";
import {
  achievementTypeLabels,
  achievementTypes,
  type AchievementTypeValue,
} from "@/features/achievement/constants";
import { AchievementFormDialog } from "@/features/achievement/components/achievement-form-dialog";
import { AchievementTable } from "@/features/achievement/components/achievement-table";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prestasi | Panel Administrasi",
  description: "Kelola prestasi siswa, guru, dan sekolah.",
};

const PAGE_SIZE = 10;

type AchievementSearchParams = {
  q?: string | string[];
  type?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type AchievementTypeFilter = "all" | AchievementTypeValue;

type AchievementStatusFilter = "all" | "published" | "draft";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeType(value: string): AchievementTypeFilter {
  return achievementTypes.includes(value as AchievementTypeValue)
    ? (value as AchievementTypeValue)
    : "all";
}

function normalizeStatus(value: string): AchievementStatusFilter {
  if (value === "published" || value === "draft") {
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
  type,
  status,
  page,
}: {
  q: string;
  type: AchievementTypeFilter;
  status: AchievementStatusFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (type !== "all") {
    parameters.set("type", type);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query
    ? `/konsol-8m4q7x2k9v6d/prestasi?${query}`
    : "/konsol-8m4q7x2k9v6d/prestasi";
}

export default async function AchievementPage({
  searchParams,
}: {
  searchParams: Promise<AchievementSearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const type = normalizeType(firstValue(parameters.type));

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const where: Prisma.AchievementWhereInput = {};

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
        category: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        winnerName: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        rank: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (type !== "all") {
    where.achievementType = type;
  }

  if (status === "published") {
    where.isPublished = true;
  }

  if (status === "draft") {
    where.isPublished = false;
  }

  const totalAchievements = await prisma.achievement.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(totalAchievements / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const achievements = await prisma.achievement.findMany({
    where,
    orderBy: [
      {
        achievementDate: "desc",
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
      achievementType: true,
      category: true,
      winnerName: true,
      competitionLevel: true,
      rank: true,
      achievementDate: true,
      description: true,
      imageUrl: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const serializedAchievements = achievements.map((achievement) => ({
    ...achievement,
    achievementDate:
      achievement.achievementDate?.toISOString().slice(0, 10) ?? null,
    publishedAt: achievement.publishedAt?.toISOString() ?? null,
    updatedAt: achievement.updatedAt.toISOString(),
  }));

  const firstItem =
    totalAchievements === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, totalAchievements);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Prestasi
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola prestasi siswa, guru, dan sekolah.
          </p>
        </div>

        {canEdit ? <AchievementFormDialog /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[1fr_190px_180px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, penerima, kategori, atau peringkat..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="type" defaultValue={type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua jenis" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua jenis</SelectItem>

                {achievementTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {achievementTypeLabels[item]}
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

                <SelectItem value="published">Terbit</SelectItem>

                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || type !== "all" || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/konsol-8m4q7x2k9v6d/prestasi">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <AchievementTable
        achievements={serializedAchievements}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {totalAchievements} prestasi.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  type,
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
                  type,
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
