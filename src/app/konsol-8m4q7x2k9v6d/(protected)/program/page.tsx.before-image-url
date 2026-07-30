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
import { UserRole, type Prisma } from "@/generated/prisma/client";
import { ProgramFormDialog } from "@/features/program/components/program-form-dialog";
import { ProgramTable } from "@/features/program/components/program-table";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Program | Panel Administrasi",
  description: "Kelola program pendidikan dan program unggulan sekolah.",
};

const PAGE_SIZE = 10;

type ProgramSearchParams = {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type ProgramStatusFilter = "all" | "active" | "inactive" | "featured";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): ProgramStatusFilter {
  if (value === "active" || value === "inactive" || value === "featured") {
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
  status,
  page,
}: {
  q: string;
  status: ProgramStatusFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query
    ? `/konsol-8m4q7x2k9v6d/program?${query}`
    : "/konsol-8m4q7x2k9v6d/program";
}

export default async function ProgramPage({
  searchParams,
}: {
  searchParams: Promise<ProgramSearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const where: Prisma.ProgramWhereInput = {};

  if (q) {
    where.OR = [
      {
        name: {
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
        shortDescription: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (status === "active") {
    where.isActive = true;
  }

  if (status === "inactive") {
    where.isActive = false;
  }

  if (status === "featured") {
    where.isFeatured = true;
  }

  const totalPrograms = await prisma.program.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(totalPrograms / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const programs = await prisma.program.findMany({
    where,
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      description: true,
      benefits: true,
      sortOrder: true,
      isFeatured: true,
      isActive: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const serializedPrograms = programs.map((program) => ({
    ...program,
    publishedAt: program.publishedAt?.toISOString() ?? null,
    updatedAt: program.updatedAt.toISOString(),
  }));

  const firstItem = totalPrograms === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, totalPrograms);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Program
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola program pendidikan dan program unggulan sekolah.
          </p>
        </div>

        {canEdit ? <ProgramFormDialog /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari nama, slug, atau deskripsi..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>

                <SelectItem value="active">Aktif</SelectItem>

                <SelectItem value="inactive">Nonaktif</SelectItem>

                <SelectItem value="featured">Program unggulan</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/konsol-8m4q7x2k9v6d/program">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <ProgramTable programs={serializedPrograms} canEdit={canEdit} />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {totalPrograms} program.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
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
