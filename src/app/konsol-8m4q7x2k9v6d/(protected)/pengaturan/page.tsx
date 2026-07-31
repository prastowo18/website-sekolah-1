import type { Metadata } from "next";

import { WebsiteSettingForm } from "@/features/website-setting/components/website-setting-form";
import { getAdminWebsiteSettings } from "@/features/website-setting/queries";
import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Pengaturan Website | Panel Administrasi",
  description: "Kelola SEO, metadata, dan indexing website.",
};

const allowedRoles = [UserRole.SUPER_ADMIN] as const;

export default async function WebsiteSettingPage() {
  await requireAdminRole(allowedRoles);

  const settings = await getAdminWebsiteSettings();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Pengaturan Website
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Kelola metadata SEO, tampilan saat tautan dibagikan, dan akses mesin
          pencari.
        </p>
      </div>

      <WebsiteSettingForm settings={settings} />
    </div>
  );
}
