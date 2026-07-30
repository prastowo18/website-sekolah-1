"use client";

import {
  CheckCircle2,
  FileImage,
  ImageOff,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { formatMediaSize, type MediaDirectory } from "../constants";
import {
  useMediaUpload,
  type MediaUploadPhase,
} from "../hooks/use-media-upload";

type ImageUploadFieldProps = {
  formId: string;
  name: string;
  directory: MediaDirectory;
  initialValue?: string;
  label?: string;
  description?: string;
  previewAlt?: string;
  error?: string;
  disabled?: boolean;
  uploadButtonLabel?: string;
  removeButtonLabel?: string;
};

function getStoredPreviewUrl(value: string): string | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const url = new URL(normalized);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

function getUploadPhaseLabel(
  phase: MediaUploadPhase,
  percentage: number,
): string {
  if (phase === "preparing") {
    return "Menyiapkan upload...";
  }

  if (phase === "uploading") {
    return `Mengunggah gambar... ${percentage}%`;
  }

  if (phase === "verifying") {
    return "Upload selesai. Memverifikasi gambar...";
  }

  return "Memproses gambar...";
}

export function ImageUploadField({
  formId,
  name,
  directory,
  initialValue = "",
  label = "Gambar",
  description = "JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB.",
  previewAlt = "Pratinjau gambar",
  error,
  disabled = false,
  uploadButtonLabel = "Upload gambar",
  removeButtonLabel = "Hapus gambar",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(initialValue);
  const [remoteImageFailed, setRemoteImageFailed] = useState(false);

  const {
    selectedFile,
    localPreviewUrl,
    status,
    phase,
    progress,
    message,
    isUploading,
    selectFile,
    upload,
    reset,
  } = useMediaUpload({
    directory,
    kind: "image",
  });

  const storedPreviewUrl = getStoredPreviewUrl(value);
  const isDisabled = disabled || isUploading;
  const inputId = `${formId}-${name}-file`;
  const errorId = error ? `${formId}-${name}-error` : undefined;

  const progressTotal =
    progress.total > 0 ? progress.total : (selectedFile?.size ?? 0);

  async function handleUpload(): Promise<void> {
    const media = await upload();

    if (!media) {
      return;
    }

    setValue(media.publicUrl);
    setRemoteImageFailed(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemove(): void {
    reset();
    setValue("");
    setRemoteImageFailed(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 md:p-5">
      <input type="hidden" name={name} value={value} />

      <div>
        <Label htmlFor={inputId}>{label}</Label>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="rounded-xl border bg-muted/30 p-1">
          <div className="relative h-56 overflow-hidden rounded-lg bg-muted md:h-72">
            {localPreviewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={localPreviewUrl}
                  alt={previewAlt}
                  className="size-full object-cover"
                />

                {!isUploading ? (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-xs text-white">
                    Pratinjau file yang dipilih
                  </div>
                ) : null}
              </>
            ) : storedPreviewUrl && !remoteImageFailed ? (
              <>
                <Image
                  src={storedPreviewUrl}
                  alt={previewAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 720px"
                  className="object-cover"
                  onError={() => {
                    setRemoteImageFailed(true);
                  }}
                />

                {!isUploading ? (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-xs text-white">
                    Gambar yang tersimpan
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex size-full items-center justify-center bg-muted/50">
                <div className="max-w-xs px-6 text-center">
                  {remoteImageFailed ? (
                    <ImageOff className="mx-auto size-10 text-muted-foreground" />
                  ) : (
                    <FileImage className="mx-auto size-10 text-muted-foreground" />
                  )}

                  <p className="mt-3 text-sm font-medium">
                    {remoteImageFailed
                      ? "Gambar tidak dapat dimuat"
                      : "Belum ada gambar"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {remoteImageFailed
                      ? "Periksa URL media atau konfigurasi domain gambar."
                      : "Pilih gambar untuk melihat pratinjau."}
                  </p>
                </div>
              </div>
            )}

            {isUploading ? (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-background px-6"
              >
                <div className="mx-auto w-full max-w-sm text-center">
                  <Loader2 className="mx-auto size-10 animate-spin text-primary" />

                  <p className="mt-4 text-sm font-semibold">
                    {getUploadPhaseLabel(phase, progress.percentage)}
                  </p>

                  {phase === "uploading" || phase === "verifying" ? (
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          {progress.percentage}%
                        </span>

                        <span className="text-muted-foreground">
                          {formatMediaSize(progress.loaded)}
                          {" / "}
                          {formatMediaSize(progressTotal)}
                        </span>
                      </div>

                      <div
                        className="h-2.5 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Progres upload gambar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress.percentage}
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-150"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                    </div>
                  )}

                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    {phase === "verifying"
                      ? "File sudah terkirim dan sedang diperiksa oleh server."
                      : "Jangan menutup dialog sebelum proses selesai."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={inputId}>Pilih file</Label>

            <Input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={isDisabled}
              aria-invalid={Boolean(error)}
              aria-describedby={errorId}
              onChange={(event) => {
                const accepted = selectFile(event.target.files?.[0] ?? null);

                if (!accepted && fileInputRef.current) {
                  fileInputRef.current.value = "";
                }

                setRemoteImageFailed(false);
              }}
            />

            {error ? (
              <p id={errorId} className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          {selectedFile ? (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="truncate text-sm font-medium">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {selectedFile.type} · {formatMediaSize(selectedFile.size)}
              </p>
            </div>
          ) : null}

          {value ? (
            <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />

              <p className="font-medium">Gambar sudah tersedia</p>
            </div>
          ) : null}

          {message ? (
            <div
              role={status === "error" ? "alert" : "status"}
              aria-live="polite"
              className={
                status === "success"
                  ? "flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"
                  : "rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              }
            >
              {status === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              ) : null}

              <p>{message}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => {
                void handleUpload();
              }}
              disabled={isDisabled || !selectedFile}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}

              {isUploading
                ? phase === "uploading"
                  ? `${progress.percentage}%`
                  : "Memproses..."
                : uploadButtonLabel}
            </Button>

            {value || localPreviewUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={isDisabled}
              >
                <Trash2 className="size-4" />
                {removeButtonLabel}
              </Button>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Pilih file, periksa pratinjau, lalu upload. Setelah proses selesai,
            simpan formulir.
          </p>
        </div>
      </div>
    </div>
  );
}
