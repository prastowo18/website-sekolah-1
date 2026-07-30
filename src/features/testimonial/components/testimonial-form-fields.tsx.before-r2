"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TestimonialFieldName } from "@/features/testimonial/types";

export type TestimonialFormValues = {
  name: string;
  role: string;
  content: string;
  photoUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

type TestimonialFieldErrors = Partial<Record<TestimonialFieldName, string[]>>;

type TestimonialFormFieldsProps = {
  formId: string;
  values: TestimonialFormValues;
  roleOptions: string[];
  errors?: TestimonialFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: TestimonialFieldName;
  errors?: TestimonialFieldErrors;
}) {
  const message = errors?.[field]?.[0];

  if (!message) {
    return null;
  }

  return (
    <p id={`${formId}-${field}-error`} className="text-sm text-destructive">
      {message}
    </p>
  );
}

function getErrorId(
  formId: string,
  field: TestimonialFieldName,
  errors?: TestimonialFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

function getSafePreviewUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

export function TestimonialFormFields({
  formId,
  values,
  roleOptions,
  errors,
  disabled = false,
}: TestimonialFormFieldsProps) {
  const [photoUrl, setPhotoUrl] = useState(values.photoUrl);

  const [isPublished, setIsPublished] = useState(values.isPublished);

  const roleListId = `${formId}-role-options`;
  const previewUrl = getSafePreviewUrl(photoUrl);

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nama pemberi testimoni</Label>

          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={values.name}
            placeholder="Masukkan nama"
            maxLength={160}
            disabled={disabled}
            aria-invalid={Boolean(errors?.name?.length)}
            aria-describedby={getErrorId(formId, "name", errors)}
            required
          />

          <FieldError formId={formId} field="name" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-role`}>Peran atau keterangan</Label>

          <Input
            id={`${formId}-role`}
            name="role"
            defaultValue={values.role}
            list={roleListId}
            placeholder="Contoh: Orang Tua Siswa"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.role?.length)}
            aria-describedby={
              errors?.role?.length
                ? `${formId}-role-error`
                : `${formId}-role-help`
            }
          />

          <datalist id={roleListId}>
            {roleOptions.map((role) => (
              <option key={role} value={role} />
            ))}

            <option value="Orang Tua Siswa" />
            <option value="Alumni" />
            <option value="Siswa" />
            <option value="Tokoh Masyarakat" />
            <option value="Mitra Sekolah" />
          </datalist>

          <p
            id={`${formId}-role-help`}
            className="text-xs text-muted-foreground"
          >
            Pilih peran yang sudah ada atau masukkan peran baru.
          </p>

          <FieldError formId={formId} field="role" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-content`}>Isi testimoni</Label>

        <Textarea
          id={`${formId}-content`}
          name="content"
          defaultValue={values.content}
          placeholder="Tuliskan isi testimoni."
          rows={8}
          maxLength={10000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.content?.length)}
          aria-describedby={getErrorId(formId, "content", errors)}
          required
        />

        <FieldError formId={formId} field="content" errors={errors} />
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">Foto pemberi testimoni</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Unggah foto langsung akan ditambahkan pada tahap integrasi object
          storage.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_160px]">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-photoUrl`}>URL foto</Label>

            <Input
              id={`${formId}-photoUrl`}
              name="photoUrl"
              value={photoUrl}
              onChange={(event) => {
                setPhotoUrl(event.target.value);
              }}
              placeholder="https://... atau /media/..."
              maxLength={4000}
              disabled={disabled}
              aria-invalid={Boolean(errors?.photoUrl?.length)}
              aria-describedby={getErrorId(formId, "photoUrl", errors)}
            />

            <FieldError formId={formId} field="photoUrl" errors={errors} />
          </div>

          <div className="space-y-2">
            <Label>Preview foto</Label>

            {previewUrl ? (
              <div
                role="img"
                aria-label="Preview foto testimoni"
                className="aspect-square w-full rounded-lg border bg-muted bg-cover bg-center"
                style={{
                  backgroundImage: `url(${JSON.stringify(previewUrl)})`,
                }}
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
                <ImageOff className="size-7" />

                <span className="mt-2 text-xs">Belum ada foto</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-4">
          <Label htmlFor={`${formId}-sortOrder`}>Urutan tampil</Label>

          <Input
            id={`${formId}-sortOrder`}
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder}
            min={0}
            max={9999}
            step={1}
            disabled={disabled}
            aria-invalid={Boolean(errors?.sortOrder?.length)}
            aria-describedby={
              errors?.sortOrder?.length
                ? `${formId}-sortOrder-error`
                : `${formId}-sortOrder-help`
            }
            required
          />

          <p
            id={`${formId}-sortOrder-help`}
            className="text-xs text-muted-foreground"
          >
            Angka lebih kecil ditampilkan lebih dahulu.
          </p>

          <FieldError formId={formId} field="sortOrder" errors={errors} />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isPublished`}>
              Publikasikan testimoni
            </Label>

            <p className="text-xs text-muted-foreground">
              Testimoni terbit dapat ditampilkan pada website publik.
            </p>
          </div>

          <input
            type="hidden"
            name="isPublished"
            value={isPublished ? "true" : "false"}
          />

          <Switch
            id={`${formId}-isPublished`}
            checked={isPublished}
            onCheckedChange={setIsPublished}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
