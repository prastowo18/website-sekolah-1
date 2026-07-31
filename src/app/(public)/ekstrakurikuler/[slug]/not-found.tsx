import { StatusPageMotionController } from "@/components/motion/status-page-motion-controller";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ExtracurricularNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <StatusPageMotionController variant="not-found" />

      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Sparkles className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Ekstrakurikuler tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Kegiatan mungkin sudah dinonaktifkan, dihapus, atau alamatnya tidak
          sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/ekstrakurikuler">
            <ArrowLeft className="size-4" />
            Kembali ke ekstrakurikuler
          </Link>
        </Button>
      </div>
    </main>
  );
}
