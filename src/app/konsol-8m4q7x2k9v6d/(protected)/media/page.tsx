import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MediaUploader } from "@/features/media-upload/components/media-uploader";

export const metadata: Metadata = {
  title: "Pengujian Media | Panel Administrasi",
  description: "Pengujian upload media ke Cloudflare R2.",
};

export default function MediaTestPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Pengujian Media
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Uji upload gambar dan dokumen sebelum uploader diterapkan pada modul
          konten.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Gambar</CardTitle>

            <CardDescription>
              JPEG, PNG, WebP, atau AVIF. Maksimal 5 MB.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <MediaUploader
              directory="posts"
              kind="image"
              label="Pilih gambar"
              description="File pengujian akan disimpan pada direktori posts."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Dokumen</CardTitle>

            <CardDescription>Hanya PDF. Maksimal 10 MB.</CardDescription>
          </CardHeader>

          <CardContent>
            <MediaUploader
              directory="documents"
              kind="document"
              label="Pilih dokumen PDF"
              description="File pengujian akan disimpan pada direktori documents."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
