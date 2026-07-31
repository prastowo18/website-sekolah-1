import { StatusPageMotionController } from "@/components/motion/status-page-motion-controller";

import { ArrowLeft, UsersRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function TeacherNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <StatusPageMotionController variant="not-found" />

      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <UsersRound className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Guru tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Profil mungkin sudah dinonaktifkan, dihapus, atau alamatnya tidak
          sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/guru">
            <ArrowLeft className="size-4" />
            Kembali ke daftar guru
          </Link>
        </Button>
      </div>
    </main>
  );
}
