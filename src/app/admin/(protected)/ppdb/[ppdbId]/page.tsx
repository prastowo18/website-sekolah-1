import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PpdbDetailManager } from "@/features/ppdb/components/ppdb-detail-manager";
import { PpdbInformationFormDialog } from "@/features/ppdb/components/ppdb-information-form-dialog";
import {
  ppdbStatusLabels,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";
import { UserRole } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Rincian PPDB | Panel Administrasi",
};

export default async function PpdbDetailPage({
  params,
}: {
  params: Promise<{
    ppdbId: string;
  }>;
}) {
  const session = await requireAdminSession();
  const { ppdbId } = await params;

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  const record = await prisma.ppdbInformation.findUnique({
    where: {
      id: ppdbId,
    },
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
      timelineItems: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            startDate: "asc",
          },
        ],
        select: {
          id: true,
          ppdbId: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      requirements: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          ppdbId: true,
          title: true,
          description: true,
          isRequired: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      flowSteps: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          ppdbId: true,
          title: true,
          description: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      fees: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          ppdbId: true,
          name: true,
          feeType: true,
          amount: true,
          description: true,
          isOptional: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!record) {
    notFound();
  }

  const serializedPpdb = {
    id: record.id,
    title: record.title,
    academicYear: record.academicYear,
    status: record.status as PpdbStatusValue,
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
  };

  const timelineItems = record.timelineItems.map((item) => ({
    id: item.id,
    ppdbId: item.ppdbId,
    title: item.title,
    description: item.description,
    startDate: item.startDate?.toISOString() ?? null,
    endDate: item.endDate?.toISOString() ?? null,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const requirements = record.requirements.map((item) => ({
    id: item.id,
    ppdbId: item.ppdbId,
    title: item.title,
    description: item.description,
    isRequired: item.isRequired,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const flowSteps = record.flowSteps.map((item) => ({
    id: item.id,
    ppdbId: item.ppdbId,
    title: item.title,
    description: item.description,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const fees = record.fees.map((item) => ({
    id: item.id,
    ppdbId: item.ppdbId,
    name: item.name,
    feeType: item.feeType,
    amount: item.amount?.toString() ?? null,
    description: item.description,
    isOptional: item.isOptional,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-3">
          <Link href="/admin/ppdb">
            <ArrowLeft className="size-4" />
            Kembali ke PPDB
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {record.title}
              </h1>

              <Badge variant={record.isActive ? "default" : "secondary"}>
                {record.isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Tahun ajaran {record.academicYear} ·{" "}
              {ppdbStatusLabels[record.status]}
            </p>
          </div>

          {canEdit ? <PpdbInformationFormDialog ppdb={serializedPpdb} /> : null}
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Kuota</p>
            <p className="mt-1 text-xl font-semibold">
              {record.quota ?? "Belum ditentukan"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Jadwal</p>
            <p className="mt-1 text-xl font-semibold">{timelineItems.length}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Persyaratan</p>
            <p className="mt-1 text-xl font-semibold">{requirements.length}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Rincian biaya</p>
            <p className="mt-1 text-xl font-semibold">{fees.length}</p>
          </div>
        </CardContent>
      </Card>

      <PpdbDetailManager
        ppdbId={record.id}
        timelineItems={timelineItems}
        requirements={requirements}
        flowSteps={flowSteps}
        fees={fees}
        canEdit={canEdit}
      />
    </div>
  );
}
