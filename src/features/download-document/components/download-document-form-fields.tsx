"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { normalizeGoogleDriveUrl } from "@/features/download-document/google-drive-url";
import type { DownloadDocumentFieldName } from "@/features/download-document/types";

export type DownloadDocumentFormValues = {
  name: string;
  slug: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  isActive: boolean;
};

type DownloadDocumentFieldErrors = Partial<
  Record<DownloadDocumentFieldName, string[]>
>;

type DownloadDocumentFormFieldsProps = {
  formId: string;
  values: DownloadDocumentFormValues;
  categoryOptions: string[];
  fileTypeOptions: string[];
  errors?: DownloadDocumentFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: DownloadDocumentFieldName;
  errors?: DownloadDocumentFieldErrors;
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
  field: DownloadDocumentFieldName,
  errors?: DownloadDocumentFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function DownloadDocumentFormFields({
  formId,
  values,
  categoryOptions,
  fileTypeOptions,
  errors,
  disabled = false,
}: DownloadDocumentFormFieldsProps) {
  const [fileUrl, setFileUrl] = useState(values.fileUrl);
  const [isActive, setIsActive] = useState(values.isActive);

  const categoryListId = `${formId}-category-options`;
  const fileTypeListId = `${formId}-file-type-options`;

  const validGoogleDriveUrl = normalizeGoogleDriveUrl(fileUrl);

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-name`}>Nama dokumen</Label>

        <Input
          id={`${formId}-name`}
          name="name"
          defaultValue={values.name}
          placeholder="Contoh: Kalender Akademik 2026"
          maxLength={200}
          disabled={disabled}
          aria-invalid={Boolean(errors?.name?.length)}
          aria-describedby={getErrorId(formId, "name", errors)}
          required
        />

        <FieldError formId={formId} field="name" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-slug`}>Slug</Label>

          <Input
            id={`${formId}-slug`}
            name="slug"
            defaultValue={values.slug}
            placeholder="Otomatis dari nama dokumen"
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
            Kosongkan agar slug dibuat otomatis dari nama dokumen.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>

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
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Jelaskan isi dan kegunaan dokumen."
          rows={5}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">Dokumen Google Drive</p>

        <p className="mt-1 text-xs text-muted-foreground">
          File tidak diunggah ke server website. Pastikan akses Google Drive
          diatur menjadi siapa saja yang memiliki link dapat melihat.
        </p>

        <div className="mt-4 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-fileUrl`}>URL Google Drive</Label>

            <Input
              id={`${formId}-fileUrl`}
              name="fileUrl"
              type="url"
              value={fileUrl}
              onChange={(event) => {
                setFileUrl(event.target.value);
              }}
              placeholder="https://drive.google.com/file/d/.../view"
              maxLength={4000}
              disabled={disabled}
              aria-invalid={Boolean(errors?.fileUrl?.length)}
              aria-describedby={
                errors?.fileUrl?.length
                  ? `${formId}-fileUrl-error`
                  : `${formId}-fileUrl-help`
              }
              required
            />

            <p
              id={`${formId}-fileUrl-help`}
              className="text-xs text-muted-foreground"
            >
              Hanya URL HTTPS dari drive.google.com atau docs.google.com yang
              diterima.
            </p>

            <FieldError formId={formId} field="fileUrl" errors={errors} />

            {validGoogleDriveUrl && !disabled ? (
              <Button type="button" variant="outline" size="sm" asChild>
                <a
                  href={validGoogleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-4" />
                  Periksa link Google Drive
                </a>
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-fileName`}>Nama file</Label>

              <Input
                id={`${formId}-fileName`}
                name="fileName"
                defaultValue={values.fileName}
                placeholder="kalender-akademik-2026.pdf"
                maxLength={255}
                disabled={disabled}
                aria-invalid={Boolean(errors?.fileName?.length)}
                aria-describedby={getErrorId(formId, "fileName", errors)}
                required
              />

              <p className="text-xs text-muted-foreground">
                Nama ini hanya menjadi label yang tampil pada website.
              </p>

              <FieldError formId={formId} field="fileName" errors={errors} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-fileType`}>Tipe file</Label>

              <Input
                id={`${formId}-fileType`}
                name="fileType"
                defaultValue={values.fileType}
                list={fileTypeListId}
                placeholder="application/pdf"
                maxLength={80}
                disabled={disabled}
                aria-invalid={Boolean(errors?.fileType?.length)}
                aria-describedby={
                  errors?.fileType?.length
                    ? `${formId}-fileType-error`
                    : `${formId}-fileType-help`
                }
              />

              <datalist id={fileTypeListId}>
                {fileTypeOptions.map((fileType) => (
                  <option key={fileType} value={fileType} />
                ))}

                <option value="application/pdf" />
                <option value="application/msword" />
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                <option value="application/vnd.ms-excel" />
                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                <option value="image/jpeg" />
                <option value="image/png" />
              </datalist>

              <p
                id={`${formId}-fileType-help`}
                className="text-xs text-muted-foreground"
              >
                Opsional. Contoh: application/pdf.
              </p>

              <FieldError formId={formId} field="fileType" errors={errors} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isActive`}>Dokumen aktif</Label>

          <p className="text-xs text-muted-foreground">
            Hanya dokumen aktif yang dapat dibuka melalui website publik.
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
