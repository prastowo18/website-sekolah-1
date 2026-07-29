"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

import {
  ppdbFeeFormSchema,
  ppdbFeeIdSchema,
  ppdbFlowStepFormSchema,
  ppdbFlowStepIdSchema,
  ppdbInformationFormSchema,
  ppdbInformationIdSchema,
  ppdbRequirementFormSchema,
  ppdbRequirementIdSchema,
  ppdbTimelineFormSchema,
  ppdbTimelineIdSchema,
} from "./schemas";
import type {
  PpdbFeeActionState,
  PpdbFeeFieldName,
  PpdbFlowStepActionState,
  PpdbFlowStepFieldName,
  PpdbInformationActionState,
  PpdbInformationFieldName,
  PpdbRequirementActionState,
  PpdbRequirementFieldName,
  PpdbTimelineActionState,
  PpdbTimelineFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const ppdbSelect = {
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
} satisfies Prisma.PpdbInformationSelect;

const timelineSelect = {
  id: true,
  ppdbId: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PpdbTimelineItemSelect;

const requirementSelect = {
  id: true,
  ppdbId: true,
  title: true,
  description: true,
  isRequired: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PpdbRequirementSelect;

const flowStepSelect = {
  id: true,
  ppdbId: true,
  title: true,
  description: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PpdbFlowStepSelect;

const feeSelect = {
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
} satisfies Prisma.PpdbFeeSelect;

type PpdbRecord = Prisma.PpdbInformationGetPayload<{
  select: typeof ppdbSelect;
}>;

type TimelineRecord = Prisma.PpdbTimelineItemGetPayload<{
  select: typeof timelineSelect;
}>;

type RequirementRecord = Prisma.PpdbRequirementGetPayload<{
  select: typeof requirementSelect;
}>;

type FlowStepRecord = Prisma.PpdbFlowStepGetPayload<{
  select: typeof flowStepSelect;
}>;

type FeeRecord = Prisma.PpdbFeeGetPayload<{
  select: typeof feeSelect;
}>;

function getInformationValues(formData: FormData) {
  return {
    title: formData.get("title"),
    academicYear: formData.get("academicYear"),
    status: formData.get("status"),
    shortDescription: formData.get("shortDescription") ?? "",
    description: formData.get("description") ?? "",
    quota: formData.get("quota") ?? "",
    brochureUrl: formData.get("brochureUrl") ?? "",
    externalRegistrationUrl: formData.get("externalRegistrationUrl") ?? "",
    registrationLocation: formData.get("registrationLocation") ?? "",
    contactPerson: formData.get("contactPerson") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    serviceHours: formData.get("serviceHours") ?? "",
    scholarshipInformation: formData.get("scholarshipInformation") ?? "",
    showFee: formData.get("showFee") ?? "",
    showExternalRegistrationButton:
      formData.get("showExternalRegistrationButton") ?? "",
    isActive: formData.get("isActive") ?? "",
  };
}

function getTimelineValues(formData: FormData) {
  return {
    ppdbId: formData.get("ppdbId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  };
}

function getRequirementValues(formData: FormData) {
  return {
    ppdbId: formData.get("ppdbId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    isRequired: formData.get("isRequired") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  };
}

function getFlowStepValues(formData: FormData) {
  return {
    ppdbId: formData.get("ppdbId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    sortOrder: formData.get("sortOrder") ?? "1",
  };
}

function getFeeValues(formData: FormData) {
  return {
    ppdbId: formData.get("ppdbId"),
    name: formData.get("name"),
    feeType: formData.get("feeType"),
    amount: formData.get("amount") ?? "",
    description: formData.get("description") ?? "",
    isOptional: formData.get("isOptional") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
  };
}

function validationState<FieldName extends string>(
  error: z.ZodError,
  message: string,
) {
  return {
    status: "error" as const,
    message,
    fieldErrors: z.flattenError(error).fieldErrors as Partial<
      Record<FieldName, string[]>
    >,
  };
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

function toPpdbAuditValue(ppdb: PpdbRecord) {
  return {
    ...ppdb,
    createdAt: ppdb.createdAt.toISOString(),
    updatedAt: ppdb.updatedAt.toISOString(),
  };
}

function toTimelineAuditValue(timeline: TimelineRecord) {
  return {
    ...timeline,
    startDate: timeline.startDate?.toISOString() ?? null,
    endDate: timeline.endDate?.toISOString() ?? null,
    createdAt: timeline.createdAt.toISOString(),
    updatedAt: timeline.updatedAt.toISOString(),
  };
}

function toRequirementAuditValue(requirement: RequirementRecord) {
  return {
    ...requirement,
    createdAt: requirement.createdAt.toISOString(),
    updatedAt: requirement.updatedAt.toISOString(),
  };
}

function toFlowStepAuditValue(flowStep: FlowStepRecord) {
  return {
    ...flowStep,
    createdAt: flowStep.createdAt.toISOString(),
    updatedAt: flowStep.updatedAt.toISOString(),
  };
}

function toFeeAuditValue(fee: FeeRecord) {
  return {
    ...fee,
    amount: fee.amount?.toString() ?? null,
    createdAt: fee.createdAt.toISOString(),
    updatedAt: fee.updatedAt.toISOString(),
  };
}

function revalidatePpdbPaths(
  ppdbIds: Array<string | null | undefined> = [],
): void {
  revalidatePath("/");
  revalidatePath("/ppdb");
  revalidatePath("/admin/ppdb");
  revalidatePath("/admin/dashboard");

  for (const id of new Set(ppdbIds)) {
    if (id) {
      revalidatePath(`/admin/ppdb/${id}`);
    }
  }
}

async function ppdbExists(ppdbId: string): Promise<boolean> {
  const record = await prisma.ppdbInformation.findUnique({
    where: {
      id: ppdbId,
    },
    select: {
      id: true,
    },
  });

  return record !== null;
}

function missingPpdbState() {
  return {
    status: "error" as const,
    message: "Informasi PPDB tidak ditemukan.",
    fieldErrors: {
      ppdbId: ["Pilih informasi PPDB yang masih tersedia."],
    },
  };
}

export async function createPpdbInformationAction(
  _previousState: PpdbInformationActionState,
  formData: FormData,
): Promise<PpdbInformationActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbInformationFormSchema.safeParse(
    getInformationValues(formData),
  );

  if (!parsed.success) {
    return validationState<PpdbInformationFieldName>(
      parsed.error,
      "Periksa kembali informasi PPDB.",
    );
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const ppdb = await transaction.ppdbInformation.create({
        data: parsed.data,
        select: ppdbSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_INFORMATION_CREATED",
          entity: "PpdbInformation",
          entityId: ppdb.id,
          newValue: toPpdbAuditValue(ppdb),
        },
      });

      return ppdb;
    });

    revalidatePpdbPaths([created.id]);

    return {
      status: "success",
      message: "Informasi PPDB berhasil ditambahkan.",
      ppdbId: created.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan informasi PPDB.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return {
        status: "error",
        message: "Tahun ajaran sudah digunakan.",
        fieldErrors: {
          academicYear: ["Gunakan tahun ajaran yang berbeda."],
        },
      };
    }

    return {
      status: "error",
      message: "Informasi PPDB gagal ditambahkan.",
    };
  }
}

export async function updatePpdbInformationAction(
  _previousState: PpdbInformationActionState,
  formData: FormData,
): Promise<PpdbInformationActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = ppdbInformationIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID informasi PPDB tidak valid.",
    };
  }

  const parsed = ppdbInformationFormSchema.safeParse(
    getInformationValues(formData),
  );

  if (!parsed.success) {
    return validationState<PpdbInformationFieldName>(
      parsed.error,
      "Periksa kembali informasi PPDB.",
    );
  }

  try {
    const current = await prisma.ppdbInformation.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: ppdbSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Informasi PPDB tidak ditemukan.",
      };
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const ppdb = await transaction.ppdbInformation.update({
        where: {
          id: current.id,
        },
        data: parsed.data,
        select: ppdbSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_INFORMATION_UPDATED",
          entity: "PpdbInformation",
          entityId: current.id,
          oldValue: toPpdbAuditValue(current),
          newValue: toPpdbAuditValue(ppdb),
        },
      });

      return ppdb;
    });

    revalidatePpdbPaths([updated.id]);

    return {
      status: "success",
      message: "Informasi PPDB berhasil diperbarui.",
      ppdbId: updated.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui informasi PPDB.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return {
        status: "error",
        message: "Tahun ajaran sudah digunakan.",
        fieldErrors: {
          academicYear: ["Gunakan tahun ajaran yang berbeda."],
        },
      };
    }

    return {
      status: "error",
      message: "Informasi PPDB gagal diperbarui.",
    };
  }
}

export async function deletePpdbInformationAction(
  _previousState: PpdbInformationActionState,
  formData: FormData,
): Promise<PpdbInformationActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbInformationIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID informasi PPDB tidak valid.",
    };
  }

  try {
    const current = await prisma.ppdbInformation.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: {
        ...ppdbSelect,
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

    if (!current) {
      return {
        status: "error",
        message: "Informasi PPDB tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.ppdbInformation.delete({
        where: {
          id: current.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_INFORMATION_DELETED",
          entity: "PpdbInformation",
          entityId: current.id,
          oldValue: {
            ...toPpdbAuditValue(current),
            deletedTimelineCount: current._count.timelineItems,
            deletedRequirementCount: current._count.requirements,
            deletedFlowStepCount: current._count.flowSteps,
            deletedFeeCount: current._count.fees,
          },
        },
      });
    });

    revalidatePpdbPaths([current.id]);

    return {
      status: "success",
      message: "Informasi PPDB dan seluruh rincian terkait berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus informasi PPDB.", error);

    return {
      status: "error",
      message: "Informasi PPDB gagal dihapus.",
    };
  }
}

export async function createPpdbTimelineAction(
  _previousState: PpdbTimelineActionState,
  formData: FormData,
): Promise<PpdbTimelineActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbTimelineFormSchema.safeParse(getTimelineValues(formData));

  if (!parsed.success) {
    return validationState<PpdbTimelineFieldName>(
      parsed.error,
      "Periksa kembali jadwal PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const timeline = await transaction.ppdbTimelineItem.create({
        data: parsed.data,
        select: timelineSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_TIMELINE_CREATED",
          entity: "PpdbTimelineItem",
          entityId: timeline.id,
          newValue: toTimelineAuditValue(timeline),
        },
      });

      return timeline;
    });

    revalidatePpdbPaths([created.ppdbId]);

    return {
      status: "success",
      message: "Jadwal PPDB berhasil ditambahkan.",
      timelineId: created.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan jadwal PPDB.", error);

    return {
      status: "error",
      message: "Jadwal PPDB gagal ditambahkan.",
    };
  }
}

export async function updatePpdbTimelineAction(
  _previousState: PpdbTimelineActionState,
  formData: FormData,
): Promise<PpdbTimelineActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = ppdbTimelineIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID jadwal PPDB tidak valid.",
    };
  }

  const parsed = ppdbTimelineFormSchema.safeParse(getTimelineValues(formData));

  if (!parsed.success) {
    return validationState<PpdbTimelineFieldName>(
      parsed.error,
      "Periksa kembali jadwal PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const current = await prisma.ppdbTimelineItem.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: timelineSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Jadwal PPDB tidak ditemukan.",
      };
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const timeline = await transaction.ppdbTimelineItem.update({
        where: {
          id: current.id,
        },
        data: parsed.data,
        select: timelineSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_TIMELINE_UPDATED",
          entity: "PpdbTimelineItem",
          entityId: current.id,
          oldValue: toTimelineAuditValue(current),
          newValue: toTimelineAuditValue(timeline),
        },
      });

      return timeline;
    });

    revalidatePpdbPaths([current.ppdbId, updated.ppdbId]);

    return {
      status: "success",
      message: "Jadwal PPDB berhasil diperbarui.",
      timelineId: updated.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui jadwal PPDB.", error);

    return {
      status: "error",
      message: "Jadwal PPDB gagal diperbarui.",
    };
  }
}

export async function deletePpdbTimelineAction(
  _previousState: PpdbTimelineActionState,
  formData: FormData,
): Promise<PpdbTimelineActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbTimelineIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID jadwal PPDB tidak valid.",
    };
  }

  try {
    const current = await prisma.ppdbTimelineItem.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: timelineSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Jadwal PPDB tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.ppdbTimelineItem.delete({
        where: {
          id: current.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_TIMELINE_DELETED",
          entity: "PpdbTimelineItem",
          entityId: current.id,
          oldValue: toTimelineAuditValue(current),
        },
      });
    });

    revalidatePpdbPaths([current.ppdbId]);

    return {
      status: "success",
      message: "Jadwal PPDB berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus jadwal PPDB.", error);

    return {
      status: "error",
      message: "Jadwal PPDB gagal dihapus.",
    };
  }
}

export async function createPpdbRequirementAction(
  _previousState: PpdbRequirementActionState,
  formData: FormData,
): Promise<PpdbRequirementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbRequirementFormSchema.safeParse(
    getRequirementValues(formData),
  );

  if (!parsed.success) {
    return validationState<PpdbRequirementFieldName>(
      parsed.error,
      "Periksa kembali persyaratan PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const requirement = await transaction.ppdbRequirement.create({
        data: parsed.data,
        select: requirementSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_REQUIREMENT_CREATED",
          entity: "PpdbRequirement",
          entityId: requirement.id,
          newValue: toRequirementAuditValue(requirement),
        },
      });

      return requirement;
    });

    revalidatePpdbPaths([created.ppdbId]);

    return {
      status: "success",
      message: "Persyaratan PPDB berhasil ditambahkan.",
      requirementId: created.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan persyaratan PPDB.", error);

    return {
      status: "error",
      message: "Persyaratan PPDB gagal ditambahkan.",
    };
  }
}

export async function updatePpdbRequirementAction(
  _previousState: PpdbRequirementActionState,
  formData: FormData,
): Promise<PpdbRequirementActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = ppdbRequirementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID persyaratan PPDB tidak valid.",
    };
  }

  const parsed = ppdbRequirementFormSchema.safeParse(
    getRequirementValues(formData),
  );

  if (!parsed.success) {
    return validationState<PpdbRequirementFieldName>(
      parsed.error,
      "Periksa kembali persyaratan PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const current = await prisma.ppdbRequirement.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: requirementSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Persyaratan PPDB tidak ditemukan.",
      };
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const requirement = await transaction.ppdbRequirement.update({
        where: {
          id: current.id,
        },
        data: parsed.data,
        select: requirementSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_REQUIREMENT_UPDATED",
          entity: "PpdbRequirement",
          entityId: current.id,
          oldValue: toRequirementAuditValue(current),
          newValue: toRequirementAuditValue(requirement),
        },
      });

      return requirement;
    });

    revalidatePpdbPaths([current.ppdbId, updated.ppdbId]);

    return {
      status: "success",
      message: "Persyaratan PPDB berhasil diperbarui.",
      requirementId: updated.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui persyaratan PPDB.", error);

    return {
      status: "error",
      message: "Persyaratan PPDB gagal diperbarui.",
    };
  }
}

export async function deletePpdbRequirementAction(
  _previousState: PpdbRequirementActionState,
  formData: FormData,
): Promise<PpdbRequirementActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbRequirementIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID persyaratan PPDB tidak valid.",
    };
  }

  try {
    const current = await prisma.ppdbRequirement.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: requirementSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Persyaratan PPDB tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.ppdbRequirement.delete({
        where: {
          id: current.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_REQUIREMENT_DELETED",
          entity: "PpdbRequirement",
          entityId: current.id,
          oldValue: toRequirementAuditValue(current),
        },
      });
    });

    revalidatePpdbPaths([current.ppdbId]);

    return {
      status: "success",
      message: "Persyaratan PPDB berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus persyaratan PPDB.", error);

    return {
      status: "error",
      message: "Persyaratan PPDB gagal dihapus.",
    };
  }
}

export async function createPpdbFlowStepAction(
  _previousState: PpdbFlowStepActionState,
  formData: FormData,
): Promise<PpdbFlowStepActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbFlowStepFormSchema.safeParse(getFlowStepValues(formData));

  if (!parsed.success) {
    return validationState<PpdbFlowStepFieldName>(
      parsed.error,
      "Periksa kembali alur PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const flowStep = await transaction.ppdbFlowStep.create({
        data: parsed.data,
        select: flowStepSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FLOW_STEP_CREATED",
          entity: "PpdbFlowStep",
          entityId: flowStep.id,
          newValue: toFlowStepAuditValue(flowStep),
        },
      });

      return flowStep;
    });

    revalidatePpdbPaths([created.ppdbId]);

    return {
      status: "success",
      message: "Langkah alur PPDB berhasil ditambahkan.",
      flowStepId: created.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan alur PPDB.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return {
        status: "error",
        message: "Nomor langkah sudah digunakan.",
        fieldErrors: {
          sortOrder: ["Gunakan nomor langkah yang berbeda."],
        },
      };
    }

    return {
      status: "error",
      message: "Langkah alur PPDB gagal ditambahkan.",
    };
  }
}

export async function updatePpdbFlowStepAction(
  _previousState: PpdbFlowStepActionState,
  formData: FormData,
): Promise<PpdbFlowStepActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = ppdbFlowStepIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID alur PPDB tidak valid.",
    };
  }

  const parsed = ppdbFlowStepFormSchema.safeParse(getFlowStepValues(formData));

  if (!parsed.success) {
    return validationState<PpdbFlowStepFieldName>(
      parsed.error,
      "Periksa kembali alur PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const current = await prisma.ppdbFlowStep.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: flowStepSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Langkah alur PPDB tidak ditemukan.",
      };
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const flowStep = await transaction.ppdbFlowStep.update({
        where: {
          id: current.id,
        },
        data: parsed.data,
        select: flowStepSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FLOW_STEP_UPDATED",
          entity: "PpdbFlowStep",
          entityId: current.id,
          oldValue: toFlowStepAuditValue(current),
          newValue: toFlowStepAuditValue(flowStep),
        },
      });

      return flowStep;
    });

    revalidatePpdbPaths([current.ppdbId, updated.ppdbId]);

    return {
      status: "success",
      message: "Langkah alur PPDB berhasil diperbarui.",
      flowStepId: updated.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui alur PPDB.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return {
        status: "error",
        message: "Nomor langkah sudah digunakan.",
        fieldErrors: {
          sortOrder: ["Gunakan nomor langkah yang berbeda."],
        },
      };
    }

    return {
      status: "error",
      message: "Langkah alur PPDB gagal diperbarui.",
    };
  }
}

export async function deletePpdbFlowStepAction(
  _previousState: PpdbFlowStepActionState,
  formData: FormData,
): Promise<PpdbFlowStepActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbFlowStepIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID alur PPDB tidak valid.",
    };
  }

  try {
    const current = await prisma.ppdbFlowStep.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: flowStepSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Langkah alur PPDB tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.ppdbFlowStep.delete({
        where: {
          id: current.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FLOW_STEP_DELETED",
          entity: "PpdbFlowStep",
          entityId: current.id,
          oldValue: toFlowStepAuditValue(current),
        },
      });
    });

    revalidatePpdbPaths([current.ppdbId]);

    return {
      status: "success",
      message: "Langkah alur PPDB berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus alur PPDB.", error);

    return {
      status: "error",
      message: "Langkah alur PPDB gagal dihapus.",
    };
  }
}

export async function createPpdbFeeAction(
  _previousState: PpdbFeeActionState,
  formData: FormData,
): Promise<PpdbFeeActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbFeeFormSchema.safeParse(getFeeValues(formData));

  if (!parsed.success) {
    return validationState<PpdbFeeFieldName>(
      parsed.error,
      "Periksa kembali rincian biaya PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const created = await prisma.$transaction(async (transaction) => {
      const fee = await transaction.ppdbFee.create({
        data: parsed.data,
        select: feeSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FEE_CREATED",
          entity: "PpdbFee",
          entityId: fee.id,
          newValue: toFeeAuditValue(fee),
        },
      });

      return fee;
    });

    revalidatePpdbPaths([created.ppdbId]);

    return {
      status: "success",
      message: "Rincian biaya PPDB berhasil ditambahkan.",
      feeId: created.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan biaya PPDB.", error);

    return {
      status: "error",
      message: "Rincian biaya PPDB gagal ditambahkan.",
    };
  }
}

export async function updatePpdbFeeAction(
  _previousState: PpdbFeeActionState,
  formData: FormData,
): Promise<PpdbFeeActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = ppdbFeeIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID biaya PPDB tidak valid.",
    };
  }

  const parsed = ppdbFeeFormSchema.safeParse(getFeeValues(formData));

  if (!parsed.success) {
    return validationState<PpdbFeeFieldName>(
      parsed.error,
      "Periksa kembali rincian biaya PPDB.",
    );
  }

  if (!(await ppdbExists(parsed.data.ppdbId))) {
    return missingPpdbState();
  }

  try {
    const current = await prisma.ppdbFee.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: feeSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Rincian biaya PPDB tidak ditemukan.",
      };
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const fee = await transaction.ppdbFee.update({
        where: {
          id: current.id,
        },
        data: parsed.data,
        select: feeSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FEE_UPDATED",
          entity: "PpdbFee",
          entityId: current.id,
          oldValue: toFeeAuditValue(current),
          newValue: toFeeAuditValue(fee),
        },
      });

      return fee;
    });

    revalidatePpdbPaths([current.ppdbId, updated.ppdbId]);

    return {
      status: "success",
      message: "Rincian biaya PPDB berhasil diperbarui.",
      feeId: updated.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui biaya PPDB.", error);

    return {
      status: "error",
      message: "Rincian biaya PPDB gagal diperbarui.",
    };
  }
}

export async function deletePpdbFeeAction(
  _previousState: PpdbFeeActionState,
  formData: FormData,
): Promise<PpdbFeeActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = ppdbFeeIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID biaya PPDB tidak valid.",
    };
  }

  try {
    const current = await prisma.ppdbFee.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: feeSelect,
    });

    if (!current) {
      return {
        status: "error",
        message: "Rincian biaya PPDB tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.ppdbFee.delete({
        where: {
          id: current.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "PPDB_FEE_DELETED",
          entity: "PpdbFee",
          entityId: current.id,
          oldValue: toFeeAuditValue(current),
        },
      });
    });

    revalidatePpdbPaths([current.ppdbId]);

    return {
      status: "success",
      message: "Rincian biaya PPDB berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus biaya PPDB.", error);

    return {
      status: "error",
      message: "Rincian biaya PPDB gagal dihapus.",
    };
  }
}
