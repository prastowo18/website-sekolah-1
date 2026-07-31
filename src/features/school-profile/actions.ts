"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import {
  deleteR2ObjectByKey,
  getR2ObjectKeyFromPublicUrl,
} from "@/lib/storage/r2-object";
import {
  completePreparedMediaCommit,
  PendingMediaCommitError,
  preparePendingMediaCommit,
  type PreparedMediaCommit,
  rollbackPreparedMediaCommit,
} from "@/lib/storage/r2-pending";

import { schoolProfileSchema } from "./schemas";
import type { SchoolProfileActionState, SchoolProfileFieldName } from "./types";

const editableRoles = [UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN] as const;

const profileSelect = {
  schoolName: true,
  shortName: true,
  npsn: true,
  logoUrl: true,
  faviconUrl: true,
  heroImageUrl: true,
  tagline: true,
  shortDescription: true,
  history: true,
  vision: true,
  mission: true,
  goals: true,
  schoolValues: true,
  accreditation: true,
  foundedYear: true,
  principalName: true,
  principalTitle: true,
  principalPhotoUrl: true,
  principalGreeting: true,
  address: true,
  village: true,
  district: true,
  city: true,
  province: true,
  postalCode: true,
  phone: true,
  whatsapp: true,
  email: true,
  operationalHours: true,
  mapEmbedUrl: true,
  latitude: true,
  longitude: true,
} as const;

type ProfileMediaField =
  "logoUrl" | "faviconUrl" | "heroImageUrl" | "principalPhotoUrl";

type PreparedProfileMedia = Record<
  ProfileMediaField,
  PreparedMediaCommit | null
>;

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function mediaErrorState(
  field: ProfileMediaField,
  error: unknown,
): SchoolProfileActionState {
  const message =
    error instanceof PendingMediaCommitError
      ? error.message
      : "Media profil gagal diproses. Upload ulang gambar lalu coba kembali.";

  return {
    status: "error",
    message: "Media profil sekolah gagal diproses.",
    fieldErrors: {
      [field]: [message],
    },
  };
}

async function rollbackPreparedProfileMedia(
  prepared: PreparedProfileMedia,
): Promise<void> {
  await Promise.allSettled([
    rollbackPreparedMediaCommit(prepared.logoUrl),
    rollbackPreparedMediaCommit(prepared.faviconUrl),
    rollbackPreparedMediaCommit(prepared.heroImageUrl),
    rollbackPreparedMediaCommit(prepared.principalPhotoUrl),
  ]);
}

async function deletePreviousProfileMedia(
  previousUrl: string | null | undefined,
  nextUrl: string | null | undefined,
): Promise<void> {
  if (!previousUrl || previousUrl === nextUrl) {
    return;
  }

  const objectKey = getR2ObjectKeyFromPublicUrl(previousUrl);

  if (!objectKey || !objectKey.startsWith("profile/")) {
    return;
  }

  try {
    await deleteR2ObjectByKey(objectKey);
  } catch (error: unknown) {
    console.error(`Gagal menghapus media profil lama: ${objectKey}`, error);
  }
}

async function completeAndCleanupProfileMedia({
  prepared,
  previousUrl,
  nextUrl,
  label,
}: {
  prepared: PreparedMediaCommit | null;
  previousUrl: string | null | undefined;
  nextUrl: string | null | undefined;
  label: string;
}): Promise<void> {
  try {
    await completePreparedMediaCommit(prepared);
  } catch (error: unknown) {
    console.error(`Gagal menyelesaikan commit media ${label}.`, error);

    return;
  }

  await deletePreviousProfileMedia(previousUrl, nextUrl);
}

export async function updateSchoolProfileAction(
  _previousState: SchoolProfileActionState,
  formData: FormData,
): Promise<SchoolProfileActionState> {
  const session = await requireAdminRole(editableRoles);

  const parsed = schoolProfileSchema.safeParse({
    schoolName: formData.get("schoolName"),
    shortName: formData.get("shortName"),
    npsn: formData.get("npsn"),
    logoUrl: formData.get("logoUrl") ?? "",
    faviconUrl: formData.get("faviconUrl") ?? "",
    heroImageUrl: formData.get("heroImageUrl") ?? "",
    principalPhotoUrl: formData.get("principalPhotoUrl") ?? "",
    tagline: formData.get("tagline"),
    shortDescription: formData.get("shortDescription"),
    history: formData.get("history"),
    vision: formData.get("vision"),
    mission: formData.get("mission"),
    goals: formData.get("goals"),
    schoolValues: formData.get("schoolValues"),
    accreditation: formData.get("accreditation"),
    foundedYear: formData.get("foundedYear"),
    principalName: formData.get("principalName"),
    principalTitle: formData.get("principalTitle"),
    principalGreeting: formData.get("principalGreeting"),
    address: formData.get("address"),
    village: formData.get("village"),
    district: formData.get("district"),
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    operationalHours: formData.get("operationalHours"),
    mapEmbedUrl: formData.get("mapEmbedUrl") ?? "",
    latitude: formData.get("latitude") ?? "",
    longitude: formData.get("longitude") ?? "",
  });

  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;

    return {
      status: "error",
      message: "Periksa kembali data profil sekolah.",
      fieldErrors: errors as Partial<Record<SchoolProfileFieldName, string[]>>,
    };
  }

  const currentProfile = await prisma.schoolProfile.findUnique({
    where: {
      id: "school",
    },
    select: profileSelect,
  });

  const prepared: PreparedProfileMedia = {
    logoUrl: null,
    faviconUrl: null,
    heroImageUrl: null,
    principalPhotoUrl: null,
  };

  let pendingField: ProfileMediaField = "logoUrl";

  try {
    pendingField = "logoUrl";
    prepared.logoUrl = await preparePendingMediaCommit(
      parsed.data.logoUrl,
      "profile",
    );

    pendingField = "faviconUrl";
    prepared.faviconUrl = await preparePendingMediaCommit(
      parsed.data.faviconUrl,
      "profile",
    );

    pendingField = "heroImageUrl";
    prepared.heroImageUrl = await preparePendingMediaCommit(
      parsed.data.heroImageUrl,
      "profile",
    );

    pendingField = "principalPhotoUrl";
    prepared.principalPhotoUrl = await preparePendingMediaCommit(
      parsed.data.principalPhotoUrl,
      "profile",
    );
  } catch (error: unknown) {
    await rollbackPreparedProfileMedia(prepared);

    return mediaErrorState(pendingField, error);
  }

  const logoUrl = prepared.logoUrl?.finalUrl ?? parsed.data.logoUrl;

  const faviconUrl = prepared.faviconUrl?.finalUrl ?? parsed.data.faviconUrl;

  const heroImageUrl =
    prepared.heroImageUrl?.finalUrl ?? parsed.data.heroImageUrl;

  const principalPhotoUrl =
    prepared.principalPhotoUrl?.finalUrl ?? parsed.data.principalPhotoUrl;

  try {
    const updatedProfile = await prisma.$transaction(async (transaction) => {
      const profile = await transaction.schoolProfile.upsert({
        where: {
          id: "school",
        },
        create: {
          id: "school",
          ...parsed.data,
          logoUrl,
          faviconUrl,
          heroImageUrl,
          principalPhotoUrl,
        },
        update: {
          ...parsed.data,
          logoUrl,
          faviconUrl,
          heroImageUrl,
          principalPhotoUrl,
        },
        select: profileSelect,
      });

      await transaction.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "SCHOOL_PROFILE_UPDATED",
          entity: "SchoolProfile",
          entityId: "school",
          oldValue: currentProfile ?? undefined,
          newValue: profile,
        },
      });

      return profile;
    });

    await Promise.all([
      completeAndCleanupProfileMedia({
        prepared: prepared.logoUrl,
        previousUrl: currentProfile?.logoUrl,
        nextUrl: updatedProfile.logoUrl,
        label: "logo sekolah",
      }),

      completeAndCleanupProfileMedia({
        prepared: prepared.faviconUrl,
        previousUrl: currentProfile?.faviconUrl,
        nextUrl: updatedProfile.faviconUrl,
        label: "favicon",
      }),

      completeAndCleanupProfileMedia({
        prepared: prepared.heroImageUrl,
        previousUrl: currentProfile?.heroImageUrl,
        nextUrl: updatedProfile.heroImageUrl,
        label: "gambar hero",
      }),

      completeAndCleanupProfileMedia({
        prepared: prepared.principalPhotoUrl,
        previousUrl: currentProfile?.principalPhotoUrl,
        nextUrl: updatedProfile.principalPhotoUrl,
        label: "foto kepala sekolah",
      }),
    ]);
  } catch (error: unknown) {
    await rollbackPreparedProfileMedia(prepared);

    console.error("Gagal memperbarui profil sekolah.", error);

    if (isPrismaUniqueError(error)) {
      return {
        status: "error",
        message: "NPSN sudah digunakan pada data lain.",
        fieldErrors: {
          npsn: ["Gunakan NPSN yang belum terdaftar."],
        },
      };
    }

    return {
      status: "error",
      message: "Profil sekolah gagal disimpan. Silakan coba kembali.",
    };
  }

  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/konsol-8m4q7x2k9v6d/dashboard");
  revalidatePath("/konsol-8m4q7x2k9v6d/profil-sekolah");

  return {
    status: "success",
    message: "Profil sekolah berhasil diperbarui.",
  };
}
