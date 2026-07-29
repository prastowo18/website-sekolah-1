import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { getCurrentSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Ubah Password | Panel Administrasi',
  description: 'Ubah password akun administrator website sekolah.',
};

export default async function ChangePasswordPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>
              {session.user.mustChangePassword
                ? 'Buat password baru'
                : 'Ubah password'}
            </CardTitle>

            <CardDescription>
              {session.user.mustChangePassword
                ? 'Anda wajib mengganti password awal sebelum membuka panel administrasi.'
                : `Ubah password untuk akun ${session.user.username}.`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
