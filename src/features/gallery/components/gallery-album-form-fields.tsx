"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { GalleryAlbumFieldName } from "@/features/gallery/types";

import { GalleryAlbumCoverField } from "./gallery-album-cover-field";

export type GalleryAlbumFormValues = {
  title: string;
  slug: string;
  description: string;
  eventDate: string;
  coverImageUrl: string;
  isPublished: boolean;
};

type GalleryAlbumFieldErrors = Partial<Record<GalleryAlbumFieldName, string[]>>;

type GalleryAlbumFormFieldsProps = {
  formId: string;
  values: GalleryAlbumFormValues;
  errors?: GalleryAlbumFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: GalleryAlbumFieldName;
  errors?: GalleryAlbumFieldErrors;
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
  field: GalleryAlbumFieldName,
  errors?: GalleryAlbumFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function GalleryAlbumFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: GalleryAlbumFormFieldsProps) {
  const [isPublished, setIsPublished] = useState(values.isPublished);

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-title`}>Judul album</Label>

        <Input
          id={`${formId}-title`}
          name="title"
          defaultValue={values.title}
          placeholder="Contoh: Perayaan Hari Kemerdekaan"
          maxLength={200}
          disabled={disabled}
          aria-invalid={Boolean(errors?.title?.length)}
          aria-describedby={getErrorId(formId, "title", errors)}
          required
        />

        <FieldError formId={formId} field="title" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-slug`}>Slug</Label>

          <Input
            id={`${formId}-slug`}
            name="slug"
            defaultValue={values.slug}
            placeholder="Otomatis dari judul"
            maxLength={220}
            disabled={disabled}
            aria-invalid={Boolean(errors?.slug?.length)}
            aria-describedby={
              errors?.slug?.length
                ? `${formId}-slug-error`
                : `${formId}-slug-help`
            }
          />

          <p
            id={`${formId}-slug-help`}
            className="text-xs text-muted-foreground"
          >
            Kosongkan agar slug dibuat otomatis dari judul album.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-eventDate`}>Tanggal kegiatan</Label>

          <Input
            id={`${formId}-eventDate`}
            name="eventDate"
            type="date"
            defaultValue={values.eventDate}
            disabled={disabled}
            aria-invalid={Boolean(errors?.eventDate?.length)}
            aria-describedby={getErrorId(formId, "eventDate", errors)}
          />

          <FieldError formId={formId} field="eventDate" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Jelaskan kegiatan atau isi album."
          rows={6}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <GalleryAlbumCoverField
        formId={formId}
        initialValue={values.coverImageUrl}
        error={errors?.coverImageUrl?.[0]}
        disabled={disabled}
      />

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isPublished`}>Publikasikan album</Label>

          <p className="text-xs text-muted-foreground">
            Album terbit dapat ditampilkan pada website publik.
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
  );
}
