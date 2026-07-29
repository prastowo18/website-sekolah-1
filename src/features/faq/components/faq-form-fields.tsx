"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FaqFieldName } from "@/features/faq/types";

export type FaqFormValues = {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
};

type FaqFieldErrors = Partial<Record<FaqFieldName, string[]>>;

type FaqFormFieldsProps = {
  formId: string;
  values: FaqFormValues;
  categoryOptions: string[];
  errors?: FaqFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: FaqFieldName;
  errors?: FaqFieldErrors;
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
  field: FaqFieldName,
  errors?: FaqFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function FaqFormFields({
  formId,
  values,
  categoryOptions,
  errors,
  disabled = false,
}: FaqFormFieldsProps) {
  const [isActive, setIsActive] = useState(values.isActive);

  const categoryListId = `${formId}-category-options`;

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-question`}>Pertanyaan</Label>

        <Textarea
          id={`${formId}-question`}
          name="question"
          defaultValue={values.question}
          placeholder="Masukkan pertanyaan yang sering diajukan."
          rows={3}
          maxLength={300}
          disabled={disabled}
          aria-invalid={Boolean(errors?.question?.length)}
          aria-describedby={getErrorId(formId, "question", errors)}
          required
        />

        <FieldError formId={formId} field="question" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-answer`}>Jawaban</Label>

        <Textarea
          id={`${formId}-answer`}
          name="answer"
          defaultValue={values.answer}
          placeholder="Tuliskan jawaban secara jelas dan mudah dipahami."
          rows={8}
          maxLength={100000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.answer?.length)}
          aria-describedby={getErrorId(formId, "answer", errors)}
          required
        />

        <FieldError formId={formId} field="answer" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-category`}>Kategori</Label>

          <Input
            id={`${formId}-category`}
            name="category"
            defaultValue={values.category}
            list={categoryListId}
            placeholder="Contoh: Akademik"
            maxLength={100}
            disabled={disabled}
            aria-invalid={Boolean(errors?.category?.length)}
            aria-describedby={
              errors?.category?.length
                ? `${formId}-category-error`
                : `${formId}-category-help`
            }
          />

          <datalist id={categoryListId}>
            {categoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>

          <p
            id={`${formId}-category-help`}
            className="text-xs text-muted-foreground"
          >
            Pilih kategori yang sudah ada atau masukkan kategori baru.
          </p>

          <FieldError formId={formId} field="category" errors={errors} />
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
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isActive`}>FAQ aktif</Label>

          <p className="text-xs text-muted-foreground">
            Hanya FAQ aktif yang dapat ditampilkan pada website publik.
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
