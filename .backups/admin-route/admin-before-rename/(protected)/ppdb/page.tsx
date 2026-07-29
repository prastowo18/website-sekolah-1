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
import { PpdbInformationFormDialog } from "@/features/ppdb/components/ppdb-information-form-dialog";
import { PpdbInformationTable } from "@/features/ppdb/components/ppdb-information-table";
import {
  ppdbStatusLabels,
  ppdbStatuses,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";
import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "PPDB | Panel Administrasi",
  description: "Kelola informasi penerimaan peserta didik baru.",
};

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  active?: string | string[];
  page?: string | string[];
};

type StatusFilter = "all" | PpdbStatusValue;

type ActiveFilter = "all" | "active" | "inactive";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeStatus(value: string): StatusFilter {
  return ppdbStatuses.includes(value as PpdbStatusValue)
    ? (value as PpdbStatusValue)
    : "all";
}

function normalizeActive(value: string): ActiveFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizePage(value: string) {
  const page = Number.parseInt(value, 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildHref({
  q,
  status,
  active,
  page,
}: {
  q: string;
  status: StatusFilter;
  active: ActiveFilter;
  page: number;
}) {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (status !== "all") {
    parameters.set("status", status);
  }

  if (active !== "all") {
    parameters.set("active", active);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/admin/ppdb?${query}` : "/admin/ppdb";
}

export default async function PpdbPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdminSession();
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const status = normalizeStatus(firstValue(parameters.status));

  const active = normalizeActive(firstValue(parameters.active));

  const requestedPage = normalizePage(firstValue(parameters.page));

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const where: Prisma.PpdbInformationWhereInput = {};

  if (q) {
    where.OR = [
      {
        title: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        academicYear: {
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
      {
        description: {
          contains: q,
          mode: "insensitive",
        },
      },
      {
        contactPerson: {
          contains: q,
          mode: "insensitive",
        },
      },
    ];
  }

  if (status !== "all") {
    where.status = status;
  }

  if (active === "active") {
    where.isActive = true;
  }

  if (active === "inactive") {
    where.isActive = false;
  }

  const total = await prisma.ppdbInformation.count({
    where,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  const records = await prisma.ppdbInformation.findMany({
    where,
    orderBy: [
      {
        isActive: "desc",
      },
      {
        academicYear: "desc",
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
      academicYear: true,
      status: true,
      shortDescription: true,
      description: true,
      quota: true,
      brochureUrl: true,
      externalRegistrationUrl: true,
      registrationLocation: true,
      contactPerson: true,
      contactPhone: true,
      contactEmail: true,
      serviceHours: true,
      scholarshipInformation: true,
      showFee: true,
      showExternalRegistrationButton: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          timelineItems: true,
          requirements: true,
          flowSteps: true,
          fees: true,
        },
      },
    },
  });

  const serialized = records.map((record) => ({
    id: record.id,
    title: record.title,
    academicYear: record.academicYear,
    status: record.status,
    shortDescription: record.shortDescription,
    description: record.description,
    quota: record.quota,
    brochureUrl: record.brochureUrl,
    externalRegistrationUrl: record.externalRegistrationUrl,
    registrationLocation: record.registrationLocation,
    contactPerson: record.contactPerson,
    contactPhone: record.contactPhone,
    contactEmail: record.contactEmail,
    serviceHours: record.serviceHours,
    scholarshipInformation: record.scholarshipInformation,
    showFee: record.showFee,
    showExternalRegistrationButton: record.showExternalRegistrationButton,
    isActive: record.isActive,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    timelineCount: record._count.timelineItems,
    requirementCount: record._count.requirements,
    flowStepCount: record._count.flowSteps,
    feeCount: record._count.fees,
  }));

  const firstItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Informasi PPDB
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola informasi penerimaan siswa tanpa formulir pendaftaran
            internal.
          </p>
        </div>

        {canEdit ? <PpdbInformationFormDialog /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pencarian dan filter</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="grid gap-3 xl:grid-cols-[1fr_200px_180px_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                name="q"
                defaultValue={q}
                placeholder="Cari judul, tahun ajaran, deskripsi, atau kontak..."
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

                {ppdbStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ppdbStatusLabels[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="active" defaultValue={active}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua tampilan" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="size-4" />
              Terapkan
            </Button>

            {q || status !== "all" || active !== "all" ? (
              <Button variant="outline" asChild>
                <Link href="/admin/ppdb">
                  <RotateCcw className="size-4" />
                  Reset
                </Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <PpdbInformationTable items={serialized} canEdit={canEdit} />

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Menampilkan {firstItem}–{lastItem} dari {total} informasi PPDB.
        </p>

        <div className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={buildHref({
                  q,
                  status,
                  active,
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
                  active,
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
