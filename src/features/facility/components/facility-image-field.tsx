"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type FacilityImageFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function FacilityImageField({
  formId,
  initialValue,
  error,
  disabled = false,
}: FacilityImageFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="imageUrl"
      directory="facilities"
      initialValue={initialValue}
      label="Foto fasilitas"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau foto fasilitas sekolah"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload foto"
      removeButtonLabel="Hapus foto"
    />
  );
}
