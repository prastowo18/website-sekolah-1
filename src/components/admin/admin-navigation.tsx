"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CircleHelp,
  FileText,
  GraduationCap,
  Images,
  LayoutDashboard,
  Mail,
  Megaphone,
  Newspaper,
  Quote,
  Settings,
  ShieldCheck,
  School,
  Shapes,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { AdminRole } from "./admin-types";

type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: AdminRole[];
};

const primaryItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profil Sekolah",
    href: "/admin/profil-sekolah",
    icon: School,
  },
  {
    title: "Program",
    href: "/admin/program",
    icon: BookOpen,
  },
  {
    title: "Fasilitas",
    href: "/admin/fasilitas",
    icon: Building2,
  },
  {
    title: "Guru",
    href: "/admin/guru",
    icon: Users,
  },
  {
    title: "Prestasi",
    href: "/admin/prestasi",
    icon: Trophy,
  },
  {
    title: "Ekstrakurikuler",
    href: "/admin/ekstrakurikuler",
    icon: Shapes,
  },
];

const publicationItems: NavigationItem[] = [
  {
    title: "Berita",
    href: "/admin/berita",
    icon: Newspaper,
  },
  {
    title: "Pengumuman",
    href: "/admin/pengumuman",
    icon: Megaphone,
  },
  {
    title: "Galeri",
    href: "/admin/galeri",
    icon: Images,
  },
  {
    title: "Dokumen",
    href: "/admin/dokumen",
    icon: FileText,
  },
  {
    title: "FAQ",
    href: "/admin/faq",
    icon: CircleHelp,
  },
  {
    title: "Testimoni",
    href: "/admin/testimoni",
    icon: Quote,
  },
  {
    title: "Informasi PPDB",
    href: "/admin/ppdb",
    icon: GraduationCap,
  },
  {
    title: "Pesan Masuk",
    href: "/admin/pesan-kontak",
    icon: Mail,
  },
];

const systemItems: NavigationItem[] = [
  {
    title: "Pengguna",
    href: "/admin/pengguna",
    icon: UserCog,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Audit Log",
    href: "/admin/audit-log",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
  },
];

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatBadgeCount(count: number): string {
  if (count > 99) {
    return "99+";
  }

  return String(count);
}

function NavigationGroup({
  label,
  items,
  role,
  newMessageCount = 0,
}: {
  label: string;
  items: NavigationItem[];
  role: AdminRole;
  newMessageCount?: number;
}) {
  const pathname = usePathname();

  const visibleItems = items.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const Icon = item.icon;

            const active = isItemActive(pathname, item.href);

            const badgeCount =
              item.href === "/admin/pesan-kontak" ? newMessageCount : 0;

            const tooltip =
              badgeCount > 0
                ? `${item.title} (${badgeCount} baru)`
                : item.title;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={tooltip}>
                  <Link href={item.href}>
                    <Icon />

                    <span>{item.title}</span>

                    {badgeCount > 0 ? (
                      <span
                        aria-label={`${badgeCount} pesan baru`}
                        className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold tabular-nums text-primary-foreground group-data-[collapsible=icon]:hidden"
                      >
                        {formatBadgeCount(badgeCount)}
                      </span>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AdminNavigation({
  role,
  newMessageCount,
}: {
  role: AdminRole;
  newMessageCount: number;
}) {
  return (
    <>
      <NavigationGroup label="Utama" items={primaryItems} role={role} />

      <NavigationGroup
        label="Publikasi"
        items={publicationItems}
        role={role}
        newMessageCount={newMessageCount}
      />

      <NavigationGroup label="Sistem" items={systemItems} role={role} />
    </>
  );
}
