"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";

type TeacherPhotoFieldProps = {
  formId: string;
  initialValue: string;
  error?: string;
  disabled?: boolean;
};

export function TeacherPhotoField({
  formId,
  initialValue,
  error,
  disabled = false,
}: TeacherPhotoFieldProps) {
  return (
    <ImageUploadField
      formId={formId}
      name="photoUrl"
      directory="teachers"
      initialValue={initialValue}
      label="Foto guru"
      description="JPEG, PNG, WebP, atau AVIF. Ukuran maksimal 5 MB."
      previewAlt="Pratinjau foto guru"
      error={error}
      disabled={disabled}
      uploadButtonLabel="Upload foto"
      removeButtonLabel="Hapus foto"
    />
  );
}
