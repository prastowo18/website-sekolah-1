"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ProgramFieldName } from "@/features/program/types";

export type ProgramFormValues = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  benefits: string;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

type ProgramFieldErrors = Partial<Record<ProgramFieldName, string[]>>;

type ProgramFormFieldsProps = {
  formId: string;
  values: ProgramFormValues;
  errors?: ProgramFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: ProgramFieldName;
  errors?: ProgramFieldErrors;
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

function errorDescription(
  formId: string,
  field: ProgramFieldName,
  errors?: ProgramFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function ProgramFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: ProgramFormFieldsProps) {
  const [isFeatured, setIsFeatured] = useState(values.isFeatured);

  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-name`}>Nama program</Label>

          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={values.name}
            placeholder="Contoh: Program Tahfiz"
            maxLength={160}
            disabled={disabled}
            aria-invalid={Boolean(errors?.name?.length)}
            aria-describedby={errorDescription(formId, "name", errors)}
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
            placeholder="Otomatis dari nama program"
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
            Kosongkan agar slug dibuat otomatis dari nama program.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-shortDescription`}>Deskripsi singkat</Label>

        <Textarea
          id={`${formId}-shortDescription`}
          name="shortDescription"
          defaultValue={values.shortDescription}
          placeholder="Ringkasan singkat untuk kartu program."
          rows={3}
          maxLength={300}
          disabled={disabled}
          aria-invalid={Boolean(errors?.shortDescription?.length)}
          aria-describedby={errorDescription(
            formId,
            "shortDescription",
            errors,
          )}
        />

        <FieldError formId={formId} field="shortDescription" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi lengkap</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Tuliskan penjelasan lengkap program."
          rows={7}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={errorDescription(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-benefits`}>Manfaat program</Label>

        <Textarea
          id={`${formId}-benefits`}
          name="benefits"
          defaultValue={values.benefits}
          placeholder={
            "Satu manfaat per baris\nContoh:\nMeningkatkan kedisiplinan\nMengembangkan kemampuan siswa"
          }
          rows={6}
          maxLength={10000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.benefits?.length)}
          aria-describedby={
            errors?.benefits?.length
              ? `${formId}-benefits-error`
              : `${formId}-benefits-help`
          }
        />

        <p
          id={`${formId}-benefits-help`}
          className="text-xs text-muted-foreground"
        >
          Tulis satu manfaat pada setiap baris.
        </p>

        <FieldError formId={formId} field="benefits" errors={errors} />
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
          aria-describedby={errorDescription(formId, "sortOrder", errors)}
        />

        <FieldError formId={formId} field="sortOrder" errors={errors} />
      </div>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isActive`}>Program aktif</Label>

            <p className="text-xs text-muted-foreground">
              Program aktif dapat ditampilkan pada website publik.
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

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isFeatured`}>Program unggulan</Label>

            <p className="text-xs text-muted-foreground">
              Program dapat ditampilkan pada bagian unggulan beranda.
            </p>
          </div>

          <input
            type="hidden"
            name="isFeatured"
            value={isFeatured ? "true" : "false"}
          />

          <Switch
            id={`${formId}-isFeatured`}
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
