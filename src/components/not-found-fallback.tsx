import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type NotFoundFallbackProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function NotFoundFallback({
  title = "Halaman tidak ditemukan",
  description = "Halaman yang dicari mungkin sudah dipindahkan, dihapus, atau alamat yang dimasukkan tidak sesuai.",
  backHref = "/",
  backLabel = "Kembali ke beranda",
}: NotFoundFallbackProps) {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-8" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Error 404
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 leading-7 text-muted-foreground">{description}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>

          {backHref !== "/" ? (
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="size-4" />
                Beranda
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
