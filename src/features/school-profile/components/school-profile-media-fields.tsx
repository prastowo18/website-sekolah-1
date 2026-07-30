"use client";

import { ImageUploadField } from "@/features/media-upload/components/image-upload-field";
import type { SchoolProfileFieldName } from "@/features/school-profile/types";

type SchoolProfileMediaFieldsProps = {
  values: {
    logoUrl: string | null;
    faviconUrl: string | null;
    heroImageUrl: string | null;
    principalPhotoUrl: string | null;
  };
  errors?: Partial<Record<SchoolProfileFieldName, string[]>>;
  disabled?: boolean;
};

export function SchoolProfileMediaFields({
  values,
  errors,
  disabled = false,
}: SchoolProfileMediaFieldsProps) {
  return (
    <div className="grid gap-6">
      <ImageUploadField
        formId="school-profile"
        name="logoUrl"
        directory="profile"
        initialValue={values.logoUrl ?? ""}
        label="Logo sekolah"
        description="Ukuran disarankan 1200 × 1200 px dengan rasio 1:1. Gunakan PNG atau WebP transparan, sisakan ruang aman sekitar 10% di tepi gambar. Maksimal 5 MB."
        previewAlt="Pratinjau logo sekolah"
        error={errors?.logoUrl?.[0]}
        disabled={disabled}
        uploadButtonLabel="Upload logo"
        removeButtonLabel="Hapus logo"
      />

      <ImageUploadField
        formId="school-profile"
        name="faviconUrl"
        directory="profile"
        initialValue={values.faviconUrl ?? ""}
        label="Favicon website"
        description="Ukuran disarankan 512 × 512 px dengan rasio 1:1. Gunakan ikon sederhana tanpa tulisan kecil agar tetap jelas saat ditampilkan pada tab browser. PNG atau WebP disarankan. Maksimal 5 MB."
        previewAlt="Pratinjau favicon website"
        error={errors?.faviconUrl?.[0]}
        disabled={disabled}
        uploadButtonLabel="Upload favicon"
        removeButtonLabel="Hapus favicon"
      />

      <ImageUploadField
        formId="school-profile"
        name="heroImageUrl"
        directory="profile"
        initialValue={values.heroImageUrl ?? ""}
        label="Gambar utama atau hero"
        description="Ukuran disarankan 1920 × 1080 px dengan rasio 16:9. Minimum 1280 × 720 px. Letakkan objek utama di bagian tengah karena gambar dapat terpotong pada layar yang berbeda. Maksimal 5 MB."
        previewAlt="Pratinjau gambar utama sekolah"
        error={errors?.heroImageUrl?.[0]}
        disabled={disabled}
        uploadButtonLabel="Upload gambar hero"
        removeButtonLabel="Hapus gambar hero"
      />

      <ImageUploadField
        formId="school-profile"
        name="principalPhotoUrl"
        directory="profile"
        initialValue={values.principalPhotoUrl ?? ""}
        label="Foto kepala sekolah"
        description="Ukuran disarankan 1200 × 1500 px dengan rasio potret 4:5. Minimum 800 × 1000 px. Posisikan wajah dan badan di tengah dengan ruang yang cukup di bagian atas. Maksimal 5 MB."
        previewAlt="Pratinjau foto kepala sekolah"
        error={errors?.principalPhotoUrl?.[0]}
        disabled={disabled}
        uploadButtonLabel="Upload foto"
        removeButtonLabel="Hapus foto"
      />
    </div>
  );
}
