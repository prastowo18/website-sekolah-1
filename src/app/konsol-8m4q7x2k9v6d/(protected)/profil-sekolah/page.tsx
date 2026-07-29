import type { Metadata } from "next";

import { UserRole } from "@/generated/prisma/client";
import { SchoolProfileForm } from "@/features/school-profile/components/school-profile-form";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profil Sekolah | Panel Administrasi",
  description: "Kelola identitas dan profil utama sekolah.",
};

export default async function SchoolProfilePage() {
  const session = await requireAdminSession();

  const profile = await prisma.schoolProfile.findUnique({
    where: {
      id: "school",
    },
    select: {
      schoolName: true,
      shortName: true,
      npsn: true,
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
    },
  });

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    session.user.role === UserRole.CONTENT_ADMIN;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Profil Sekolah
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola identitas, sejarah, visi, kontak, dan informasi kepala sekolah.
        </p>
      </div>

      <SchoolProfileForm
        canEdit={canEdit}
        profile={
          profile ?? {
            schoolName: "Nama Sekolah",
            shortName: null,
            npsn: null,
            tagline: null,
            shortDescription: null,
            history: null,
            vision: null,
            mission: [],
            goals: [],
            schoolValues: [],
            accreditation: null,
            foundedYear: null,
            principalName: null,
            principalTitle: null,
            principalGreeting: null,
            address: null,
            village: null,
            district: null,
            city: null,
            province: null,
            postalCode: null,
            phone: null,
            whatsapp: null,
            email: null,
            operationalHours: null,
          }
        }
      />
    </div>
  );
}
