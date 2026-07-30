"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type ExtracurricularImageFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function ExtracurricularImageField({
  formId,
  initialValue,
  error,
  disabled = false,
}: ExtracurricularImageFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="imageUrl"
      directory="extracurriculars"
      initialValue={initialValue}
      label="Gambar ekstrakurikuler"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau gambar kegiatan ekstrakurikuler"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload gambar"
      removeButtonLabel="Hapus gambar"
    />
  );
}
