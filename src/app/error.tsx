"use client";

import {
  ErrorFallback,
  type ErrorBoundaryProps,
} from "@/components/error-fallback";

export default function ApplicationError(props: ErrorBoundaryProps) {
  return (
    <ErrorFallback
      {...props}
      title="Aplikasi mengalami gangguan"
      description="Permintaan tidak dapat diselesaikan karena terjadi kesalahan pada aplikasi."
    />
  );
}
