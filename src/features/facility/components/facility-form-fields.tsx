"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FacilityFieldName } from "@/features/facility/types";

export type FacilityFormValues = {
  name: string;
  slug: string;
  description: string;
  capacity: string;
  condition: string;
  sortOrder: number;
  isActive: boolean;
};

type FacilityFieldErrors = Partial<Record<FacilityFieldName, string[]>>;

type FacilityFormFieldsProps = {
  formId: string;
  values: FacilityFormValues;
  errors?: FacilityFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: FacilityFieldName;
  errors?: FacilityFieldErrors;
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
  field: FacilityFieldName,
  errors?: FacilityFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function FacilityFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: FacilityFormFieldsProps) {
  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nama fasilitas</Label>

          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={values.name}
            placeholder="Contoh: Perpustakaan"
            maxLength={160}
            disabled={disabled}
            aria-invalid={Boolean(errors?.name?.length)}
            aria-describedby={getErrorId(formId, "name", errors)}
            required
          />

          <FieldError formId={formId} field="name" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-slug`}>Slug</Label>

          <Input
            id={`${formId}-slug`}
            name="slug"
            defaultValue={values.slug}
            placeholder="Otomatis dari nama fasilitas"
            maxLength={180}
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
            Kosongkan untuk membuat slug otomatis dari nama fasilitas.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Jelaskan fungsi, kondisi, dan keunggulan fasilitas."
          rows={7}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-capacity`}>Kapasitas</Label>

          <Input
            id={`${formId}-capacity`}
            name="capacity"
            defaultValue={values.capacity}
            placeholder="Contoh: 30 siswa"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.capacity?.length)}
            aria-describedby={getErrorId(formId, "capacity", errors)}
          />

          <FieldError formId={formId} field="capacity" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-condition`}>Kondisi</Label>

          <Input
            id={`${formId}-condition`}
            name="condition"
            defaultValue={values.condition}
            placeholder="Contoh: Sangat baik"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.condition?.length)}
            aria-describedby={getErrorId(formId, "condition", errors)}
          />

          <FieldError formId={formId} field="condition" errors={errors} />
        </div>
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

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isActive`}>Fasilitas aktif</Label>

          <p className="text-xs text-muted-foreground">
            Fasilitas aktif dapat ditampilkan pada website publik.
          </p>
        </div>

        <input
          type="hidden"
          name="isActive"
          value={isActive ? "true" : "false"}
        />

        <Switch
          id={`${formId}-isActive`}
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
