import { redirect } from 'next/navigation';

import { UserRole } from '@/generated/prisma/client';
import { requireAdminSession } from '@/lib/auth/require-session';

export async function requireAdminRole(allowedRoles: readonly UserRole[]) {
  const session = await requireAdminSession();

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/admin/dashboard');
  }

  return session;
}
