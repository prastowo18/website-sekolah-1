"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ExtracurricularFieldName } from "@/features/extracurricular/types";

export type ExtracurricularFormValues = {
  name: string;
  slug: string;
  description: string;
  schedule: string;
  coach: string;
  targetClasses: string;
  sortOrder: number;
  isActive: boolean;
};

type ExtracurricularFieldErrors = Partial<
  Record<ExtracurricularFieldName, string[]>
>;

type ExtracurricularFormFieldsProps = {
  formId: string;
  values: ExtracurricularFormValues;
  errors?: ExtracurricularFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: ExtracurricularFieldName;
  errors?: ExtracurricularFieldErrors;
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
  field: ExtracurricularFieldName,
  errors?: ExtracurricularFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function ExtracurricularFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: ExtracurricularFormFieldsProps) {
  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nama ekstrakurikuler</Label>

          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={values.name}
            placeholder="Contoh: Pramuka"
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
            placeholder="Otomatis dari nama"
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
            Kosongkan agar slug dibuat otomatis dari nama ekstrakurikuler.
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
          placeholder="Jelaskan tujuan, kegiatan, dan manfaat ekstrakurikuler."
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
          <Label htmlFor={`${formId}-schedule`}>Jadwal kegiatan</Label>

          <Input
            id={`${formId}-schedule`}
            name="schedule"
            defaultValue={values.schedule}
            placeholder="Contoh: Jumat, 14.00–16.00"
            maxLength={180}
            disabled={disabled}
            aria-invalid={Boolean(errors?.schedule?.length)}
            aria-describedby={getErrorId(formId, "schedule", errors)}
          />

          <FieldError formId={formId} field="schedule" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-coach`}>Pembina</Label>

          <Input
            id={`${formId}-coach`}
            name="coach"
            defaultValue={values.coach}
            placeholder="Nama guru atau pembina"
            maxLength={160}
            disabled={disabled}
            aria-invalid={Boolean(errors?.coach?.length)}
            aria-describedby={getErrorId(formId, "coach", errors)}
          />

          <FieldError formId={formId} field="coach" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-targetClasses`}>Kelompok kelas</Label>

        <Textarea
          id={`${formId}-targetClasses`}
          name="targetClasses"
          defaultValue={values.targetClasses}
          placeholder={"Satu kelompok per baris\nContoh:\nKelas 1–3\nKelas 4–6"}
          rows={5}
          maxLength={5000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.targetClasses?.length)}
          aria-describedby={
            errors?.targetClasses?.length
              ? `${formId}-targetClasses-error`
              : `${formId}-targetClasses-help`
          }
        />

        <p
          id={`${formId}-targetClasses-help`}
          className="text-xs text-muted-foreground"
        >
          Tulis satu kelompok kelas pada setiap baris.
        </p>

        <FieldError formId={formId} field="targetClasses" errors={errors} />
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
          <Label htmlFor={`${formId}-isActive`}>Ekstrakurikuler aktif</Label>

          <p className="text-xs text-muted-foreground">
            Data aktif dapat ditampilkan pada website publik.
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
