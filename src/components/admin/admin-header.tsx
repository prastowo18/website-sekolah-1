import {
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/components/admin/admin-types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AdminHeaderProps = {
  user: {
    name: string;
    role: AdminRole;
  };
};

export function AdminHeader({
  user,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />

      <Separator
        orientation="vertical"
        className="mr-2 h-4"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          Panel Administrasi
        </p>

        <p className="truncate text-xs text-muted-foreground">
          Selamat datang, {user.name}
        </p>
      </div>

      <Badge
        variant="secondary"
        className="hidden sm:inline-flex"
      >
        {ADMIN_ROLE_LABELS[user.role]}
      </Badge>
    </header>
  );
}
