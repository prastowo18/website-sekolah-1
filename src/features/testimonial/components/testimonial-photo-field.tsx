"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type TestimonialPhotoFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function TestimonialPhotoField({
  formId,
  initialValue,
  error,
  disabled = false,
}: TestimonialPhotoFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="photoUrl"
      directory="testimonials"
      initialValue={initialValue}
      label="Foto pemberi testimoni"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau foto pemberi testimoni"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload foto"
      removeButtonLabel="Hapus foto"
    />
  );
}
