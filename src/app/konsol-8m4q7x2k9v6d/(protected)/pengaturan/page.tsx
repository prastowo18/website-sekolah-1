import type { Metadata } from "next";

import { WebsiteSettingForm } from "@/features/website-setting/components/website-setting-form";
import { getAdminWebsiteSettings } from "@/features/website-setting/queries";
import { UserRole } from "@/generated/prisma/client";
import { requireAdminRole } from "@/lib/auth/authorization";

export const metadata: Metadata = {
  title: "Pengaturan Website | Panel Administrasi",
  description:
    "Kelola SEO, tampilan beranda, formulir kontak, WhatsApp, dan kebijakan privasi website.",
};

export const dynamic = "force-dynamic";

export default async function WebsiteSettingPage() {
  await requireAdminRole([UserRole.SUPER_ADMIN]);

  const settings = await getAdminWebsiteSettings();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Pengaturan Website
        </h1>
        <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
          Kelola SEO, label tombol beranda, statistik, formulir kontak, tombol
          WhatsApp, dan ringkasan kebijakan privasi. Seluruh perubahan disimpan
          pada database dan langsung digunakan website publik.
        </p>
      </header>

      <WebsiteSettingForm settings={settings} />
    </div>
  );
}
