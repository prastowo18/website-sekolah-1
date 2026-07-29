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
    href: "/konsol-8m4q7x2k9v6d/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profil Sekolah",
    href: "/konsol-8m4q7x2k9v6d/profil-sekolah",
    icon: School,
  },
  {
    title: "Program",
    href: "/konsol-8m4q7x2k9v6d/program",
    icon: BookOpen,
  },
  {
    title: "Fasilitas",
    href: "/konsol-8m4q7x2k9v6d/fasilitas",
    icon: Building2,
  },
  {
    title: "Guru",
    href: "/konsol-8m4q7x2k9v6d/guru",
    icon: Users,
  },
  {
    title: "Prestasi",
    href: "/konsol-8m4q7x2k9v6d/prestasi",
    icon: Trophy,
  },
  {
    title: "Ekstrakurikuler",
    href: "/konsol-8m4q7x2k9v6d/ekstrakurikuler",
    icon: Shapes,
  },
];

const publicationItems: NavigationItem[] = [
  {
    title: "Berita",
    href: "/konsol-8m4q7x2k9v6d/berita",
    icon: Newspaper,
  },
  {
    title: "Pengumuman",
    href: "/konsol-8m4q7x2k9v6d/pengumuman",
    icon: Megaphone,
  },
  {
    title: "Galeri",
    href: "/konsol-8m4q7x2k9v6d/galeri",
    icon: Images,
  },
  {
    title: "Dokumen",
    href: "/konsol-8m4q7x2k9v6d/dokumen",
    icon: FileText,
  },
  {
    title: "FAQ",
    href: "/konsol-8m4q7x2k9v6d/faq",
    icon: CircleHelp,
  },
  {
    title: "Testimoni",
    href: "/konsol-8m4q7x2k9v6d/testimoni",
    icon: Quote,
  },
  {
    title: "Informasi PPDB",
    href: "/konsol-8m4q7x2k9v6d/ppdb",
    icon: GraduationCap,
  },
  {
    title: "Pesan Masuk",
    href: "/konsol-8m4q7x2k9v6d/pesan-kontak",
    icon: Mail,
  },
];

const systemItems: NavigationItem[] = [
  {
    title: "Pengguna",
    href: "/konsol-8m4q7x2k9v6d/pengguna",
    icon: UserCog,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Pengaturan",
    href: "/konsol-8m4q7x2k9v6d/pengaturan",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "Audit Log",
    href: "/konsol-8m4q7x2k9v6d/audit-log",
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
              item.href === "/konsol-8m4q7x2k9v6d/pesan-kontak"
                ? newMessageCount
                : 0;

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
