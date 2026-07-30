"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import {
  deleteR2ObjectByKey,
  getR2ObjectKeyFromPublicUrl,
} from "@/lib/storage/r2-object";
import {
  completePreparedMediaCommit,
  PendingMediaCommitError,
  preparePendingMediaCommit,
  rollbackPreparedMediaCommit,
  type PreparedMediaCommit,
} from "@/lib/storage/r2-pending";

import { facilityFormSchema, facilityIdSchema } from "./schemas";
import type { FacilityActionState, FacilityFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const FACILITY_MEDIA_PREFIX = "facilities/";

const facilitySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  capacity: true,
  condition: true,
  isActive: true,
  sortOrder: true,
} as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function getFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    capacity: formData.get("capacity") ?? "",
    condition: formData.get("condition") ?? "",
    sortOrder: formData.get("sortOrder") ?? "0",
    isActive: formData.get("isActive") ?? "",
  };
}

function validationErrorState(error: z.ZodError): FacilityActionState {
  const errors = z.flattenError(error).fieldErrors;

  return {
    status: "error",
    message: "Periksa kembali data fasilitas.",
    fieldErrors: errors as Partial<Record<FacilityFieldName, string[]>>,
  };
}

function validateSlug(name: string, inputSlug: string): string | null {
  const slug = createSlug(inputSlug || name);

  return slug || null;
}

function invalidSlugState(): FacilityActionState {
  return {
    status: "error",
    message: "Slug fasilitas tidak valid.",
    fieldErrors: {
      slug: ["Gunakan nama atau slug yang mengandung huruf atau angka."],
    },
  };
}

function uniqueSlugState(): FacilityActionState {
  return {
    status: "error",
    message: "Slug sudah digunakan oleh fasilitas lain.",
    fieldErrors: {
      slug: ["Gunakan slug yang berbeda."],
    },
  };
}

function invalidPendingImageState(message: string): FacilityActionState {
  return {
    status: "error",
    message: "Foto fasilitas belum dapat diterapkan.",
    fieldErrors: {
      imageUrl: [message],
    },
  };
}

function revalidateFacilityPaths(
  slugs: Array<string | null | undefined> = [],
): void {
  revalidatePath("/");
  revalidatePath("/fasilitas");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
  revalidatePath("/konsol-8m4q7x2k9v6d/fasilitas");

  for (const slug of new Set(slugs)) {
    if (slug) {
      revalidatePath(`/fasilitas/${slug}`);
    }
  }
}

async function cleanupFacilityImage({
  previousUrl,
  nextUrl = null,
}: {
  previousUrl: string | null | undefined;
  nextUrl?: string | null | undefined;
}): Promise<void> {
  const previousKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!previousKey || !previousKey.startsWith(FACILITY_MEDIA_PREFIX)) {
    return;
  }

  const nextKey = getR2ObjectKeyFromPublicUrl(nextUrl);

  if (nextKey === previousKey) {
    return;
  }

  try {
    await deleteR2ObjectByKey(previousKey);
  } catch (error) {
    console.error("Gagal menghapus foto fasilitas lama dari R2.", {
      objectKey: previousKey,
      error,
    });
  }
}

export async function createFacilityAction(
  _previousState: FacilityActionState,
  formData: FormData,
): Promise<FacilityActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = facilityFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = validateSlug(parsed.data.name, parsed.data.slug);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "facilities",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const createdFacility = await prisma.$transaction(async (transaction) => {
      const facility = await transaction.facility.create({
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          imageUrl,
          capacity: parsed.data.capacity,
          condition: parsed.data.condition,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: facilitySelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FACILITY_CREATED",
          entity: "Facility",
          entityId: facility.id,
          newValue: facility,
        },
      });

      return facility;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedImage);

    revalidateFacilityPaths([createdFacility.slug]);

    return {
      status: "success",
      message: "Fasilitas berhasil ditambahkan.",
      facilityId: createdFacility.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal menambahkan fasilitas.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Fasilitas gagal ditambahkan. Silakan coba kembali.",
    };
  }
}

export async function updateFacilityAction(
  _previousState: FacilityActionState,
  formData: FormData,
): Promise<FacilityActionState> {
  const session = await requireAdminRole(editableRoles);

  const idParsed = facilityIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!idParsed.success) {
    return {
      status: "error",
      message: "ID fasilitas tidak valid.",
    };
  }

  const parsed = facilityFormSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const slug = validateSlug(parsed.data.name, parsed.data.slug);

  if (!slug) {
    return invalidSlugState();
  }

  let preparedImage: PreparedMediaCommit | null = null;
  let databaseCommitted = false;

  try {
    const currentFacility = await prisma.facility.findUnique({
      where: {
        id: idParsed.data.id,
      },
      select: facilitySelect,
    });

    if (!currentFacility) {
      return {
        status: "error",
        message: "Fasilitas tidak ditemukan.",
      };
    }

    preparedImage = await preparePendingMediaCommit(
      parsed.data.imageUrl,
      "facilities",
    );

    const imageUrl = preparedImage?.finalUrl ?? parsed.data.imageUrl;

    const updatedFacility = await prisma.$transaction(async (transaction) => {
      const facility = await transaction.facility.update({
        where: {
          id: currentFacility.id,
        },
        data: {
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          imageUrl,
          capacity: parsed.data.capacity,
          condition: parsed.data.condition,
          sortOrder: parsed.data.sortOrder,
          isActive: parsed.data.isActive,
        },
        select: facilitySelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FACILITY_UPDATED",
          entity: "Facility",
          entityId: currentFacility.id,
          oldValue: currentFacility,
          newValue: facility,
        },
      });

      return facility;
    });

    databaseCommitted = true;

    await completePreparedMediaCommit(preparedImage);

    await cleanupFacilityImage({
      previousUrl: currentFacility.imageUrl,
      nextUrl: updatedFacility.imageUrl,
    });

    revalidateFacilityPaths([currentFacility.slug, updatedFacility.slug]);

    return {
      status: "success",
      message: "Fasilitas berhasil diperbarui.",
      facilityId: updatedFacility.id,
    };
  } catch (error: unknown) {
    if (!databaseCommitted) {
      await rollbackPreparedMediaCommit(preparedImage);
    }

    console.error("Gagal memperbarui fasilitas.", error);

    if (error instanceof PendingMediaCommitError) {
      return invalidPendingImageState(error.message);
    }

    if (isUniqueConstraintError(error)) {
      return uniqueSlugState();
    }

    return {
      status: "error",
      message: "Fasilitas gagal diperbarui. Silakan coba kembali.",
    };
  }
}

export async function deleteFacilityAction(
  _previousState: FacilityActionState,
  formData: FormData,
): Promise<FacilityActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = facilityIdSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "ID fasilitas tidak valid.",
    };
  }

  try {
    const currentFacility = await prisma.facility.findUnique({
      where: {
        id: parsed.data.id,
      },
      select: facilitySelect,
    });

    if (!currentFacility) {
      return {
        status: "error",
        message: "Fasilitas tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.facility.delete({
        where: {
          id: currentFacility.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "FACILITY_DELETED",
          entity: "Facility",
          entityId: currentFacility.id,
          oldValue: currentFacility,
        },
      });
    });

    await cleanupFacilityImage({
      previousUrl: currentFacility.imageUrl,
    });

    revalidateFacilityPaths([currentFacility.slug]);

    return {
      status: "success",
      message: "Fasilitas berhasil dihapus.",
    };
  } catch (error: unknown) {
    console.error("Gagal menghapus fasilitas.", error);

    return {
      status: "error",
      message: "Fasilitas gagal dihapus. Silakan coba kembali.",
    };
  }
}
