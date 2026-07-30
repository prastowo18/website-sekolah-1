"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type AchievementImageFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function AchievementImageField({
  formId,
  initialValue,
  error,
  disabled = false,
}: AchievementImageFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="imageUrl"
      directory="achievements"
      initialValue={initialValue}
      label="Gambar prestasi"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau dokumentasi prestasi"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload gambar"
      removeButtonLabel="Hapus gambar"
    />
  );
}
