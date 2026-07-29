import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AchievementNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Trophy className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Prestasi tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Prestasi mungkin belum dipublikasikan, telah dihapus, atau alamatnya
          tidak sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/prestasi">
            <ArrowLeft className="size-4" />
            Kembali ke daftar prestasi
          </Link>
        </Button>
      </div>
    </main>
  );
}
