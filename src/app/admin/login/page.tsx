import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/features/auth/components/login-form';
import { getCurrentSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Login Admin | Website Sekolah',
  description: 'Halaman login panel administrasi website sekolah.',
};

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(
      session.user.mustChangePassword
        ? '/admin/ubah-password'
        : '/admin/dashboard',
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
            SD
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Panel Administrasi
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Kelola informasi dan konten website sekolah.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Masuk ke akun</CardTitle>

            <CardDescription>
              Gunakan username atau email admin yang telah terdaftar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm />
          </CardContent>

          <CardFooter className="justify-center border-t">
            <p className="text-center text-xs text-muted-foreground">
              Akses hanya untuk pengguna yang berwenang.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
