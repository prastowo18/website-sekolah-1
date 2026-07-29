import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function FacilityNotFound() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Fasilitas tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Fasilitas mungkin sudah dinonaktifkan, dihapus, atau alamatnya tidak
          sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/fasilitas">
            <ArrowLeft className="size-4" />
            Kembali ke daftar fasilitas
          </Link>
        </Button>
      </div>
    </main>
  );
}
