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
import { TestimonialFormDialog } from "@/features/testimonial/components/testimonial-form-dialog";
import { TestimonialTable } from "@/features/testimonial/components/testimonial-table";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Testimoni | Panel Administrasi",
  description: "Kelola testimoni sekolah.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  role?: string | string[];
  status?: string | string[];
  page?: string | string[];
};

type StatusFilter = "all" | "published" | "unpublished";

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): StatusFilter {
  if (value === "published" || value === "unpublished") {
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
  role,
  status,
  page,
}: {
  q: string;
  role: string;
  status: StatusFilter;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (role) {
    parameters.set("role", role);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/admin/testimoni?${query}` : "/admin/testimoni";
}

export default async function TestimonialPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedRole = firstValue(parameters.role).trim().slice(0, 120);

  const status = normalizeStatus(firstValue(parameters.status));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const roleRecords = await prisma.testimonial.findMany({
    where: {
      role: {
        not: null,
      },
    },
    distinct: ["role"],
    orderBy: {
      role: "asc",
    },
    select: {
      role: true,
    },
  });

  const roleOptions = roleRecords
    .map((record) => record.role)
    .filter((role): role is string => Boolean(role));

  const role = roleOptions.includes(requestedRole) ? requestedRole : "";

  const where: Prisma.TestimonialWhereInput = {};

  if (q) {
    where.OR = [
      {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        role: {
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

  if (role) {
    where.role = role;
  }

  if (status === "published") {
    where.isPublished = true;
  }

  if (status === "unpublished") {
    where.isPublished = false;
  }

  const total = await prisma.testimonial.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const testimonials = await prisma.testimonial.findMany({
    where,
    orderBy: [
      {
        isPublished: "desc",
      },
      {
        sortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      role: true,
      content: true,
      photoUrl: true,
      isPublished: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const serialized = testimonials.map((testimonial) => ({
    id: testimonial.id,
    name: testimonial.name,
    role: testimonial.role,
    content: testimonial.content,
    photoUrl: testimonial.photoUrl,
    isPublished: testimonial.isPublished,
    sortOrder: testimonial.sortOrder,
    createdAt: testimonial.createdAt.toISOString(),
    updatedAt: testimonial.updatedAt.toISOString(),
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Testimoni
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola testimoni, foto, urutan tampil, dan status publikasi.
          </p>
        </div>

        {canEdit ? <TestimonialFormDialog roleOptions={roleOptions} /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_220px_220px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari nama, peran, atau isi testimoni..."
                className="pl-9"
                maxLength={100}
              />
            </div>

            <Select name="role" defaultValue={role || "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua peran" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua peran</SelectItem>

                {roleOptions.map((item) => (
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

                <SelectItem value="published">Dipublikasikan</SelectItem>

                <SelectItem value="unpublished">
                  Belum dipublikasikan
                </SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || role || status !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/admin/testimoni">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <TestimonialTable
        testimonials={serialized}
        roleOptions={roleOptions}
        canEdit={canEdit}
      />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} testimoni.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  role,
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
                  role,
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
