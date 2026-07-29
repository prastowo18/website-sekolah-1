import { ArrowLeft, MessageSquareOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ContactMessageNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg text-center">
        <MessageSquareOff className="mx-auto size-12 text-muted-foreground" />

        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          Pesan tidak ditemukan
        </h1>

        <p className="mt-3 text-muted-foreground">
          Pesan mungkin sudah dihapus atau ID yang digunakan tidak sesuai.
        </p>

        <Button className="mt-7" asChild>
          <Link href="/konsol-8m4q7x2k9v6d/pesan-kontak">
            <ArrowLeft className="size-4" />
            Kembali ke pesan kontak
          </Link>
        </Button>
      </div>
    </div>
  );
}
