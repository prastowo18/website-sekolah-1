"use client";

import {
  ErrorFallback,
  type ErrorBoundaryProps,
} from "@/components/error-fallback";

export default function PublicError(props: ErrorBoundaryProps) {
  return (
    <ErrorFallback
      {...props}
      title="Informasi sekolah gagal dimuat"
      description="Terjadi gangguan saat memuat halaman publik sekolah. Data Anda tidak berubah."
    />
  );
}
