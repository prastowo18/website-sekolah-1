import {
  GraduationCap,
  LogOut,
} from "lucide-react";
import Link from "next/link";

import { AdminNavigation } from "@/components/admin/admin-navigation";
import {
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/components/admin/admin-types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/features/auth/logout-action";

type AdminSidebarProps = {
  user: {
    name: string;
    username: string;
    role: AdminRole;
  };
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AdminSidebar({
  user,
}: AdminSidebarProps) {
  const roleLabel =
    ADMIN_ROLE_LABELS[user.role];

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Website Sekolah"
            >
              <Link href="/admin/dashboard">
  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
  
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Website Sekolah
                  </span>
  
                  <span className="truncate text-xs text-muted-foreground">
                    Panel Administrasi
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <AdminNavigation role={user.role} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm"
              title={`${user.name} — ${roleLabel}`}
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                {getInitials(user.name)}
              </div>

              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </span>
              </div>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <form
              action={logoutAction}
              className="w-full"
            >
              <SidebarMenuButton
                type="submit"
                tooltip="Keluar"
                className="w-full"
              >
                <LogOut />
                <span>Keluar</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
