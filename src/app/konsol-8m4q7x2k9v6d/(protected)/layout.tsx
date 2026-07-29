import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { AdminRole } from "@/components/admin/admin-types";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ContactMessageStatus } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/auth/require-session";
import { prisma } from "@/lib/prisma";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  const newMessageCount = await prisma.contactMessage.count({
    where: {
      status: ContactMessageStatus.NEW,
    },
  });

  const user = {
    name: session.user.name,
    username: session.user.username,
    role: session.user.role as AdminRole,
  };

  return (
    <SidebarProvider>
      <AdminSidebar user={user} newMessageCount={newMessageCount} />

      <SidebarInset className="min-w-0">
        <AdminHeader
          user={{
            name: user.name,
            role: user.role,
          }}
        />

        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
