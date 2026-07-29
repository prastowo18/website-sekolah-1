"use client";

import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createMediaUploadAction, finalizeMediaUploadAction } from "../actions";
import {
  ALLOWED_MEDIA_TYPES,
  MEDIA_TYPE_RULES,
  formatMediaSize,
  type AllowedMediaType,
  type MediaDirectory,
  type MediaKind,
} from "../constants";

type UploadedMedia = {
  objectKey: string;
  publicUrl: string;
  contentType: AllowedMediaType;
  size: number;
};

type MediaUploaderProps = {
  directory: MediaDirectory;
  kind: MediaKind;
  label: string;
  description?: string;
};

function isAllowedMediaType(value: string): value is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value);
}

export function MediaUploader({
  directory,
  kind,
  label,
  description,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(
    null,
  );

  const [message, setMessage] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const accept =
    kind === "image"
      ? "image/jpeg,image/png,image/webp,image/avif"
      : "application/pdf";

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setUploadedMedia(null);

    if (!selectedFile) {
      setMessage("Pilih file terlebih dahulu.");

      return;
    }

    if (!isAllowedMediaType(selectedFile.type)) {
      setMessage("Format file tidak didukung.");

      return;
    }

    const rule = MEDIA_TYPE_RULES[selectedFile.type];

    if (rule.kind !== kind) {
      setMessage("Jenis file tidak sesuai.");

      return;
    }

    if (selectedFile.size > rule.maxBytes) {
      setMessage(`Ukuran maksimal ${formatMediaSize(rule.maxBytes)}.`);

      return;
    }

    setIsUploading(true);

    try {
      const presigned = await createMediaUploadAction({
        directory,
        kind,

        originalName: selectedFile.name,

        contentType: selectedFile.type,

        size: selectedFile.size,
      });

      if (presigned.status === "error") {
        setMessage(presigned.message);

        return;
      }

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",

        headers: {
          "Content-Type": selectedFile.type,

          "x-amz-meta-upload-token": presigned.uploadToken,
        },

        body: selectedFile,
      });

      if (!uploadResponse.ok) {
        setMessage(
          `Upload ke penyimpanan gagal. HTTP ${uploadResponse.status}.`,
        );

        return;
      }

      const finalized = await finalizeMediaUploadAction({
        temporaryKey: presigned.temporaryKey,

        uploadToken: presigned.uploadToken,

        expectedContentType: selectedFile.type,

        expectedSize: selectedFile.size,
      });

      if (finalized.status === "error") {
        setMessage(finalized.message);

        return;
      }

      setUploadedMedia({
        objectKey: finalized.objectKey,

        publicUrl: finalized.publicUrl,

        contentType: finalized.contentType,

        size: finalized.size,
      });

      setMessage(finalized.message);

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error("Media upload failed:", error);

      setMessage("Upload media gagal. Periksa koneksi dan coba kembali.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-5">
      <div>
        <Label htmlFor={`media-${directory}-${kind}`}>{label}</Label>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}

        <Input
          ref={inputRef}
          id={`media-${directory}-${kind}`}
          type="file"
          accept={accept}
          className="mt-3"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            setSelectedFile(file);

            setMessage("");
            setUploadedMedia(null);
          }}
        />
      </div>

      {selectedFile ? (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <FileUp className="mt-0.5 size-5 shrink-0 text-primary" />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {selectedFile.type} · {formatMediaSize(selectedFile.size)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          aria-live="polite"
          className={
            uploadedMedia
              ? "rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"
              : "rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          }
        >
          <div className="flex items-start gap-2">
            {uploadedMedia ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : null}

            <p>{message}</p>
          </div>
        </div>
      ) : null}

      {uploadedMedia ? (
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">File tersimpan</p>

          <p className="mt-2 break-all text-muted-foreground">
            {uploadedMedia.objectKey}
          </p>

          <a
            href={uploadedMedia.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-primary underline-offset-4 hover:underline"
          >
            Buka file publik
          </a>
        </div>
      ) : null}

      <Button type="submit" disabled={isUploading || !selectedFile}>
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}

        {isUploading ? "Mengunggah..." : "Unggah media"}
      </Button>
    </form>
  );
}
