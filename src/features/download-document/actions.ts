"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";

import {
  downloadDocumentFormSchema,
  downloadDocumentIdSchema,
} from "./schemas";
import type {
  DownloadDocumentActionState,
  DownloadDocumentFieldName,
} from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const documentSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  fileUrl: true,
  fileName: true,
  fileSizeBytes: true,
  fileType: true,
  downloadCount: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DownloadDocumentSelect;

type DownloadDocumentRecord = Prisma.DownloadDocumentGetPayload<{
  select: typeof documentSelect;
}>;

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    category: formData.get("category") ?? "",
    fileUrl: formData.get("fileUrl"),
    fileName: formData.get("fileName"),
    fileSizeBytes: formData.get("fileSizeBytes") ?? "",
    fileType: formData.get("fileType") ?? "",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): DownloadDocumentActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data dokumen.",
    fieldErrors: errors as Partial<Record<DownloadDocumentFieldName, string[]>>,
  };
}

function invalidSlugState(): DownloadDocumentActionState {
  return {
    status: "error",
    message: "Slug dokumen tidak valid.",
    fieldErrors: {
      slug: ["Gunakan nama atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): DownloadDocumentActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh dokumen lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
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

function toAuditValue(document: DownloadDocumentRecord) {
  return {
    ...document,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

function revalidateDocumentPaths(
  slugs: Array<string | null | undefined> = [],
): void {
  revalidatePath("/");
  revalidatePath("/dokumen");
  revalidatePath("/admin/dokumen");
  revalidatePath("/admin/dashboard");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/dokumen/${slug}`);
    }
  }
}

export async function createDownloadDocumentAction(
  _previousState: DownloadDocumentActionState,
  formData: FormData,
): Promise<DownloadDocumentActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = downloadDocumentFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const createdDocument = await prisma.$transaction(async (transaction) => {
      const document = await transaction.downloadDocument.create({
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          category: parsed.data.category,
          fileUrl: parsed.data.fileUrl,
          fileName: parsed.data.fileName,
          fileSizeBytes: parsed.data.fileSizeBytes,
          fileType: parsed.data.fileType,
          isActive: parsed.data.isActive,
        },
        select: documentSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DOWNLOAD_DOCUMENT_CREATED",
          entity: "DownloadDocument",
          entityId: document.id,
          newValue: toAuditValue(document),
        },
      });

      return document;
    });

    revalidateDocumentPaths([createdDocument.slug]);

    return {
      status: "success",
      message: "Dokumen berhasil ditambahkan.",
      documentId: createdDocument.id,
    };
  } catch (error: unknown) {
    console.error("Gagal menambahkan dokumen.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Dokumen gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateDownloadDocumentAction(
  _previousState: DownloadDocumentActionState,
  formData: FormData,
): Promise<DownloadDocumentActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = downloadDocumentIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID dokumen tidak valid.",
    };
  }

  const parsed = downloadDocumentFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = createSlug(parsed.data.slug || parsed.data.name);

  if (!slug) {
    return invalidSlugState();
  }

  try {
    const currentDocument = await prisma.downloadDocument.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: documentSelect,
    });

    if (!currentDocument) {
      return {
        status: "error",
        message: "Dokumen tidak ditemukan.",
      };
    }

    const updatedDocument = await prisma.$transaction(async (transaction) => {
      const document = await transaction.downloadDocument.update({
        where: {
          id: currentDocument.id,
        },
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          category: parsed.data.category,
          fileUrl: parsed.data.fileUrl,
          fileName: parsed.data.fileName,
          fileSizeBytes: parsed.data.fileSizeBytes,
          fileType: parsed.data.fileType,
          isActive: parsed.data.isActive,
        },
        select: documentSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DOWNLOAD_DOCUMENT_UPDATED",
          entity: "DownloadDocument",
          entityId: currentDocument.id,
          oldValue: toAuditValue(currentDocument),
          newValue: toAuditValue(document),
        },
      });

      return document;
    });

    revalidateDocumentPaths([currentDocument.slug, updatedDocument.slug]);

    return {
      status: "success",
      message: "Dokumen berhasil diperbarui.",
      documentId: updatedDocument.id,
    };
  } catch (error: unknown) {
    console.error("Gagal memperbarui dokumen.", error);

    if (hasPrismaErrorCode(error, "P2002")) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Dokumen gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteDownloadDocumentAction(
  _previousState: DownloadDocumentActionState,
  formData: FormData,
): Promise<DownloadDocumentActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = downloadDocumentIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID dokumen tidak valid.",
    };
  }

  try {
    const currentDocument = await prisma.downloadDocument.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: documentSelect,
    });

    if (!currentDocument) {
      return {
        status: "error",
        message: "Dokumen tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.downloadDocument.delete({
        where: {
          id: currentDocument.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "DOWNLOAD_DOCUMENT_DELETED",
          entity: "DownloadDocument",
          entityId: currentDocument.id,
          oldValue: toAuditValue(currentDocument),
        },
      });
    });

    revalidateDocumentPaths([currentDocument.slug]);

    return {
      status: "success",
      message: "Dokumen berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus dokumen.", error);

    return {
      status: "error",
      message: "Dokumen gagal dihapus. Silakan coba kembali.",
    };
  }
}
