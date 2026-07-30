"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type ProgramImageFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function ProgramImageField({
  formId,
  initialValue,
  error,
  disabled = false,
}: ProgramImageFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="imageUrl"
      directory="programs"
      initialValue={initialValue}
      label="Gambar program"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau gambar program sekolah"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload gambar"
      removeButtonLabel="Hapus gambar"
    />
  );
}
