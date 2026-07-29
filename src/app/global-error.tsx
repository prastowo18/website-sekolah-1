"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <main
          role="alert"
          aria-live="assertive"
          style={{
            width: "100%",
            maxWidth: "560px",
            padding: "36px",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            background: "#ffffff",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              background: "#fee2e2",
              color: "#b91c1c",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            !
          </div>

          <h1
            style={{
              margin: "24px 0 0",
              fontSize: "30px",
              lineHeight: 1.2,
            }}
          >
            Website tidak dapat dimuat
          </h1>

          <p
            style={{
              margin: "14px auto 0",
              maxWidth: "460px",
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Terjadi gangguan yang menyebabkan aplikasi tidak dapat menampilkan
            halaman. Silakan coba memuat ulang.
          </p>

          {error.digest ? (
            <p
              style={{
                marginTop: "16px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Kode referensi:{" "}
              <code
                style={{
                  padding: "3px 7px",
                  borderRadius: "5px",
                  background: "#f1f5f9",
                }}
              >
                {error.digest}
              </code>
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => retry?.()}
            disabled={!retry}
            style={{
              marginTop: "28px",
              border: 0,
              borderRadius: "8px",
              padding: "12px 20px",
              background: retry ? "#0f172a" : "#94a3b8",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: retry ? "pointer" : "not-allowed",
            }}
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
