"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  galleryMediaTypeLabels,
  galleryMediaTypes,
  type GalleryMediaTypeValue,
} from "@/features/gallery/constants";
import type { GalleryMediaFieldName } from "@/features/gallery/types";

export type GalleryAlbumOption = {
  id: string;
  title: string;
};

export type GalleryMediaFormValues = {
  albumId: string;
  mediaType: GalleryMediaTypeValue;
  fileUrl: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  sortOrder: number;
};

type GalleryMediaFieldErrors = Partial<Record<GalleryMediaFieldName, string[]>>;

type GalleryMediaFormFieldsProps = {
  formId: string;
  values: GalleryMediaFormValues;
  albums: GalleryAlbumOption[];
  errors?: GalleryMediaFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: GalleryMediaFieldName;
  errors?: GalleryMediaFieldErrors;
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
  field: GalleryMediaFieldName,
  errors?: GalleryMediaFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function GalleryMediaFormFields({
  formId,
  values,
  albums,
  errors,
  disabled = false,
}: GalleryMediaFormFieldsProps) {
  const [albumId, setAlbumId] = useState(values.albumId);

  const [mediaType, setMediaType] = useState<GalleryMediaTypeValue>(
    values.mediaType,
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-albumId`}>Album</Label>

          <input type="hidden" name="albumId" value={albumId} />

          <Select
            value={albumId}
            onValueChange={setAlbumId}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-albumId`}
              className="w-full"
              aria-invalid={Boolean(errors?.albumId?.length)}
              aria-describedby={getErrorId(formId, "albumId", errors)}
            >
              <SelectValue placeholder="Pilih album" />
            </SelectTrigger>

            <SelectContent>
              {albums.map((album) => (
                <SelectItem key={album.id} value={album.id}>
                  {album.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="albumId" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-mediaType`}>Jenis media</Label>

          <input type="hidden" name="mediaType" value={mediaType} />

          <Select
            value={mediaType}
            onValueChange={(value) => {
              setMediaType(value as GalleryMediaTypeValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-mediaType`}
              className="w-full"
              aria-invalid={Boolean(errors?.mediaType?.length)}
              aria-describedby={getErrorId(formId, "mediaType", errors)}
            >
              <SelectValue placeholder="Pilih jenis media" />
            </SelectTrigger>

            <SelectContent>
              {galleryMediaTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {galleryMediaTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="mediaType" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-fileUrl`}>URL media</Label>

        <Input
          id={`${formId}-fileUrl`}
          name="fileUrl"
          defaultValue={values.fileUrl}
          placeholder={
            mediaType === "YOUTUBE"
              ? "https://www.youtube.com/watch?v=..."
              : "https://... atau /media/..."
          }
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.fileUrl?.length)}
          aria-describedby={getErrorId(formId, "fileUrl", errors)}
          required
        />

        <FieldError formId={formId} field="fileUrl" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-thumbnailUrl`}>URL thumbnail</Label>

        <Input
          id={`${formId}-thumbnailUrl`}
          name="thumbnailUrl"
          defaultValue={values.thumbnailUrl}
          placeholder="Opsional untuk video atau YouTube"
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.thumbnailUrl?.length)}
          aria-describedby={getErrorId(formId, "thumbnailUrl", errors)}
        />

        <FieldError formId={formId} field="thumbnailUrl" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-caption`}>Keterangan</Label>

        <Textarea
          id={`${formId}-caption`}
          name="caption"
          defaultValue={values.caption}
          placeholder="Keterangan singkat mengenai media."
          rows={4}
          maxLength={300}
          disabled={disabled}
          aria-invalid={Boolean(errors?.caption?.length)}
          aria-describedby={getErrorId(formId, "caption", errors)}
        />

        <FieldError formId={formId} field="caption" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-altText`}>Teks alternatif</Label>

          <Input
            id={`${formId}-altText`}
            name="altText"
            defaultValue={values.altText}
            placeholder="Deskripsi gambar untuk aksesibilitas"
            maxLength={220}
            disabled={disabled}
            aria-invalid={Boolean(errors?.altText?.length)}
            aria-describedby={getErrorId(formId, "altText", errors)}
          />

          <FieldError formId={formId} field="altText" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-sortOrder`}>Urutan tampil</Label>

          <Input
            id={`${formId}-sortOrder`}
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder}
            min={0}
            max={9999}
            disabled={disabled}
            aria-invalid={Boolean(errors?.sortOrder?.length)}
            aria-describedby={getErrorId(formId, "sortOrder", errors)}
          />

          <FieldError formId={formId} field="sortOrder" errors={errors} />
        </div>
      </div>
    </div>
  );
}
