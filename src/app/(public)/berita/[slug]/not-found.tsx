import { StatusPageMotionController } from "@/components/motion/status-page-motion-controller";

import { ArrowLeft, Newspaper } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <StatusPageMotionController variant="not-found" />

      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Newspaper className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Berita tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Berita mungkin belum dipublikasikan, telah diarsipkan, atau alamatnya
          tidak sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/berita">
            <ArrowLeft className="size-4" />
            Kembali ke daftar berita
          </Link>
        </Button>
      </div>
    </main>
  );
}
