"use client";

import type { AllowedMediaType } from "./constants";

export type MediaUploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

type UploadFileWithProgressOptions = {
  uploadUrl: string;
  file: File;
  contentType: AllowedMediaType;
  uploadToken: string;

  onProgress: (progress: MediaUploadProgress) => void;
};

export class MediaUploadRequestError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);

    this.name = "MediaUploadRequestError";

    this.status = status;
  }
}

function calculatePercentage(loaded: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((loaded / total) * 100)));
}

export function uploadFileWithProgress({
  uploadUrl,
  file,
  contentType,
  uploadToken,
  onProgress,
}: UploadFileWithProgressOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.upload.addEventListener("progress", (event) => {
      const total =
        event.lengthComputable && event.total > 0 ? event.total : file.size;

      const loaded = Math.min(event.loaded, total);

      onProgress({
        loaded,
        total,

        percentage: calculatePercentage(loaded, total),
      });
    });

    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
        });

        resolve();

        return;
      }

      reject(
        new MediaUploadRequestError(
          `Upload file gagal. HTTP ${request.status}.`,
          request.status,
        ),
      );
    });

    request.addEventListener("error", () => {
      reject(
        new MediaUploadRequestError("Koneksi terputus saat mengunggah file."),
      );
    });

    request.addEventListener("abort", () => {
      reject(new MediaUploadRequestError("Upload file dibatalkan."));
    });

    request.addEventListener("timeout", () => {
      reject(new MediaUploadRequestError("Upload file melewati batas waktu."));
    });

    request.open("PUT", uploadUrl);

    request.timeout = 10 * 60 * 1000;

    request.setRequestHeader("Content-Type", contentType);

    request.setRequestHeader("x-amz-meta-upload-token", uploadToken);

    request.send(file);
  });
}
