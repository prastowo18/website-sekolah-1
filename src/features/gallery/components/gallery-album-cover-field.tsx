"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type GalleryAlbumCoverFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function GalleryAlbumCoverField({
  formId,
  initialValue,
  error,
  disabled = false,
}: GalleryAlbumCoverFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="coverImageUrl"
      directory="galleries"
      initialValue={initialValue}
      label="Gambar sampul album"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau gambar sampul album galeri"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload sampul"
      removeButtonLabel="Hapus sampul"
    />
  );
}
