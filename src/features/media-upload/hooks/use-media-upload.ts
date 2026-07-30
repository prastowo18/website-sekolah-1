"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createMediaUploadAction, finalizeMediaUploadAction } from "../actions";
import {
  ALLOWED_MEDIA_TYPES,
  MEDIA_TYPE_RULES,
  formatMediaSize,
  type AllowedMediaType,
  type MediaDirectory,
  type MediaKind,
} from "../constants";
import {
  MediaUploadRequestError,
  uploadFileWithProgress,
  type MediaUploadProgress,
} from "../upload-with-progress";

export type MediaUploadPhase = "idle" | "preparing" | "uploading" | "verifying";

export type MediaUploadStatus = "idle" | "success" | "error";

export type UploadedMedia = {
  objectKey: string;
  publicUrl: string;
  contentType: AllowedMediaType;
  size: number;
};

type UseMediaUploadOptions = {
  directory: MediaDirectory;
  kind: MediaKind;

  onUploaded?: (media: UploadedMedia) => void;
};

const initialProgress: MediaUploadProgress = {
  loaded: 0,
  total: 0,
  percentage: 0,
};

function isAllowedMediaType(value: string): value is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(value);
}

export function useMediaUpload({
  directory,
  kind,
  onUploaded,
}: UseMediaUploadOptions) {
  const localPreviewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(
    null,
  );

  const [status, setStatus] = useState<MediaUploadStatus>("idle");

  const [phase, setPhase] = useState<MediaUploadPhase>("idle");

  const [progress, setProgress] =
    useState<MediaUploadProgress>(initialProgress);

  const [message, setMessage] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const clearLocalPreview = useCallback((): void => {
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);

      localPreviewUrlRef.current = null;
    }

    setLocalPreviewUrl("");
  }, []);

  const resetUploadState = useCallback((): void => {
    setStatus("idle");
    setPhase("idle");
    setProgress(initialProgress);
    setMessage("");
    setUploadedMedia(null);
  }, []);

  const reset = useCallback((): void => {
    clearLocalPreview();

    setSelectedFile(null);
    resetUploadState();
  }, [clearLocalPreview, resetUploadState]);

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  const selectFile = useCallback(
    (file: File | null): boolean => {
      clearLocalPreview();

      setSelectedFile(null);
      resetUploadState();

      if (!file) {
        return true;
      }

      if (!isAllowedMediaType(file.type)) {
        setStatus("error");

        setMessage("Format file tidak didukung.");

        return false;
      }

      const rule = MEDIA_TYPE_RULES[file.type];

      if (rule.kind !== kind) {
        setStatus("error");

        setMessage(
          kind === "image"
            ? "File yang dipilih bukan gambar yang didukung."
            : "File yang dipilih bukan dokumen yang didukung.",
        );

        return false;
      }

      if (file.size > rule.maxBytes) {
        setStatus("error");

        setMessage(`Ukuran file maksimal ${formatMediaSize(rule.maxBytes)}.`);

        return false;
      }

      setSelectedFile(file);

      setProgress({
        loaded: 0,
        total: file.size,
        percentage: 0,
      });

      if (kind === "image") {
        const objectUrl = URL.createObjectURL(file);

        localPreviewUrlRef.current = objectUrl;

        setLocalPreviewUrl(objectUrl);
      }

      return true;
    },
    [clearLocalPreview, kind, resetUploadState],
  );

  const upload = useCallback(async (): Promise<UploadedMedia | null> => {
    setStatus("idle");
    setMessage("");

    if (!selectedFile) {
      setStatus("error");

      setMessage("Pilih file terlebih dahulu.");

      return null;
    }

    if (!isAllowedMediaType(selectedFile.type)) {
      setStatus("error");

      setMessage("Format file tidak didukung.");

      return null;
    }

    const contentType = selectedFile.type;

    const rule = MEDIA_TYPE_RULES[contentType];

    if (rule.kind !== kind) {
      setStatus("error");

      setMessage("Jenis file tidak sesuai.");

      return null;
    }

    if (selectedFile.size > rule.maxBytes) {
      setStatus("error");

      setMessage(`Ukuran file maksimal ${formatMediaSize(rule.maxBytes)}.`);

      return null;
    }

    setIsUploading(true);
    setPhase("preparing");

    setProgress({
      loaded: 0,
      total: selectedFile.size,
      percentage: 0,
    });

    try {
      const presigned = await createMediaUploadAction({
        directory,
        kind,

        originalName: selectedFile.name,

        contentType,

        size: selectedFile.size,
      });

      if (presigned.status === "error") {
        setStatus("error");

        setMessage(presigned.message);

        return null;
      }

      setPhase("uploading");

      await uploadFileWithProgress({
        uploadUrl: presigned.uploadUrl,

        file: selectedFile,

        contentType,

        uploadToken: presigned.uploadToken,

        onProgress: setProgress,
      });

      setPhase("verifying");

      setProgress({
        loaded: selectedFile.size,

        total: selectedFile.size,

        percentage: 100,
      });

      const finalized = await finalizeMediaUploadAction({
        temporaryKey: presigned.temporaryKey,

        uploadToken: presigned.uploadToken,

        expectedContentType: contentType,

        expectedSize: selectedFile.size,
      });

      if (finalized.status === "error") {
        setStatus("error");

        setMessage(finalized.message);

        return null;
      }

      const media: UploadedMedia = {
        objectKey: finalized.objectKey,

        publicUrl: finalized.publicUrl,

        contentType: finalized.contentType,

        size: finalized.size,
      };

      setUploadedMedia(media);
      setSelectedFile(null);
      setStatus("success");

      setMessage(
        "File berhasil diunggah. Simpan formulir untuk menerapkan media.",
      );

      onUploaded?.(media);

      return media;
    } catch (error) {
      console.error("Media upload failed:", error);

      setStatus("error");

      setMessage(
        error instanceof MediaUploadRequestError
          ? error.message
          : "File belum dapat diunggah. Periksa koneksi dan coba kembali.",
      );

      return null;
    } finally {
      setIsUploading(false);
      setPhase("idle");
    }
  }, [directory, kind, onUploaded, selectedFile]);

  return {
    selectedFile,
    localPreviewUrl,
    uploadedMedia,

    status,
    phase,
    progress,
    message,
    isUploading,

    selectFile,
    upload,
    reset,
    clearLocalPreview,
  };
}
