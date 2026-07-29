import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/konsol-8m4q7x2k9v6d/login");
  }

  if (session.user.mustChangePassword) {
    redirect("/konsol-8m4q7x2k9v6d/ubah-password");
  }

  return session;
}
