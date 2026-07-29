"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export type ErrorBoundaryProps = {
  error: Error & {
    digest?: string;
  };
  reset?: () => void;
  unstable_retry?: () => void;
};

type ErrorFallbackProps = ErrorBoundaryProps & {
  title?: string;
  description?: string;
};

export function ErrorFallback({
  error,
  reset,
  unstable_retry,
  title = "Terjadi kesalahan",
  description = "Halaman tidak dapat dimuat karena terjadi gangguan yang tidak terduga.",
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error("Application error boundary:", error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <main
      className="flex min-h-[65svh] items-center justify-center px-4 py-16"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>

        <p className="mt-3 leading-7 text-muted-foreground">{description}</p>

        {error.digest ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Kode referensi:{" "}
            <code className="rounded bg-muted px-2 py-1">{error.digest}</code>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={() => retry?.()} disabled={!retry}>
            <RefreshCcw className="size-4" />
            Coba lagi
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="size-4" />
              Kembali ke beranda
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Muat ulang halaman apabila gangguan masih terjadi.
        </p>
      </div>
    </main>
  );
}
