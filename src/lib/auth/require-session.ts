import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.mustChangePassword) {
    redirect("/admin/ubah-password");
  }

  return session;
}
