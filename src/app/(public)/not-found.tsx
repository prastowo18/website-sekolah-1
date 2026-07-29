import { NotFoundFallback } from "@/components/not-found-fallback";

export default function PublicNotFound() {
  return (
    <NotFoundFallback
      title="Informasi tidak ditemukan"
      description="Konten sekolah yang dicari mungkin belum dipublikasikan, sudah dinonaktifkan, atau alamatnya tidak sesuai."
    />
  );
}
