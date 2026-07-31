import { StatusPageMotionController } from "@/components/motion/status-page-motion-controller";

import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function GalleryNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <StatusPageMotionController variant="not-found" />

      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Images className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Album tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Album mungkin belum dipublikasikan, telah dihapus, atau alamatnya
          tidak sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/galeri">
            <ArrowLeft className="size-4" />
            Kembali ke galeri
          </Link>
        </Button>
      </div>
    </main>
  );
}
