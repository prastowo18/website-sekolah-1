"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type PostFeaturedImageFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function PostFeaturedImageField({
  formId,
  initialValue,
  error,
  disabled = false,
}: PostFeaturedImageFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="featuredImageUrl"
      directory="posts"
      initialValue={initialValue}
      label="Gambar utama"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau gambar utama berita"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload gambar"
      removeButtonLabel="Hapus gambar"
    />
  );
}
