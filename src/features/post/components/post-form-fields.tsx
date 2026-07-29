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
  postStatusLabels,
  postStatuses,
  type PostStatusValue,
} from "@/features/post/constants";
import type { PostFieldName } from "@/features/post/types";

export type PostCategoryOption = {
  id: string;
  name: string;
};

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  status: PostStatusValue;
  scheduledAt: string;
  categoryId: string;
  seoTitle: string;
  seoDescription: string;
};

type PostFieldErrors = Partial<Record<PostFieldName, string[]>>;

type PostFormFieldsProps = {
  formId: string;
  values: PostFormValues;
  categories: PostCategoryOption[];
  errors?: PostFieldErrors;
  disabled?: boolean;
};

function isoToWibLocal(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const wibTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return wibTime.toISOString().slice(0, 16);
}

function wibLocalToIso(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}:00+07:00`);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: PostFieldName;
  errors?: PostFieldErrors;
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
  field: PostFieldName,
  errors?: PostFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function PostFormFields({
  formId,
  values,
  categories,
  errors,
  disabled = false,
}: PostFormFieldsProps) {
  const [status, setStatus] = useState<PostStatusValue>(values.status);

  const [categoryId, setCategoryId] = useState(values.categoryId || "none");

  const [scheduledLocal, setScheduledLocal] = useState(() =>
    isoToWibLocal(values.scheduledAt),
  );

  const scheduledIso =
    status === "SCHEDULED" ? wibLocalToIso(scheduledLocal) : "";

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-title`}>Judul berita</Label>

        <Input
          id={`${formId}-title`}
          name="title"
          defaultValue={values.title}
          placeholder="Masukkan judul berita"
          maxLength={240}
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
            maxLength={260}
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
            Kosongkan agar slug dibuat otomatis dari judul berita.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-category`}>Kategori</Label>

          <input
            type="hidden"
            name="categoryId"
            value={categoryId === "none" ? "" : categoryId}
          />

          <Select
            value={categoryId}
            onValueChange={setCategoryId}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-category`}
              className="w-full"
              aria-invalid={Boolean(errors?.categoryId?.length)}
              aria-describedby={getErrorId(formId, "categoryId", errors)}
            >
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">Tanpa kategori</SelectItem>

              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="categoryId" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-excerpt`}>Ringkasan</Label>

        <Textarea
          id={`${formId}-excerpt`}
          name="excerpt"
          defaultValue={values.excerpt}
          placeholder="Ringkasan singkat yang tampil pada daftar berita."
          rows={3}
          maxLength={360}
          disabled={disabled}
          aria-invalid={Boolean(errors?.excerpt?.length)}
          aria-describedby={getErrorId(formId, "excerpt", errors)}
        />

        <FieldError formId={formId} field="excerpt" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-content`}>Isi berita</Label>

        <Textarea
          id={`${formId}-content`}
          name="content"
          defaultValue={values.content}
          placeholder="Tuliskan isi berita secara lengkap."
          rows={14}
          maxLength={100000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.content?.length)}
          aria-describedby={getErrorId(formId, "content", errors)}
          required
        />

        <p className="text-xs text-muted-foreground">
          Editor teks kaya akan ditambahkan pada tahap penyempurnaan konten.
        </p>

        <FieldError formId={formId} field="content" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-featuredImageUrl`}>URL gambar utama</Label>

        <Input
          id={`${formId}-featuredImageUrl`}
          name="featuredImageUrl"
          type="url"
          defaultValue={values.featuredImageUrl}
          placeholder="https://..."
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.featuredImageUrl?.length)}
          aria-describedby={getErrorId(formId, "featuredImageUrl", errors)}
        />

        <FieldError formId={formId} field="featuredImageUrl" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-status`}>Status berita</Label>

          <input type="hidden" name="status" value={status} />

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as PostStatusValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-status`}
              className="w-full"
              aria-invalid={Boolean(errors?.status?.length)}
              aria-describedby={getErrorId(formId, "status", errors)}
            >
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>

            <SelectContent>
              {postStatuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {postStatusLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="status" errors={errors} />
        </div>

        {status === "SCHEDULED" ? (
          <div className="space-y-2">
            <Label htmlFor={`${formId}-scheduledAt`}>Jadwal publikasi</Label>

            <input type="hidden" name="scheduledAt" value={scheduledIso} />

            <Input
              id={`${formId}-scheduledAt`}
              type="datetime-local"
              value={scheduledLocal}
              onChange={(event) => {
                setScheduledLocal(event.target.value);
              }}
              disabled={disabled}
              aria-invalid={Boolean(errors?.scheduledAt?.length)}
              aria-describedby={
                errors?.scheduledAt?.length
                  ? `${formId}-scheduledAt-error`
                  : `${formId}-scheduledAt-help`
              }
              required
            />

            <p
              id={`${formId}-scheduledAt-help`}
              className="text-xs text-muted-foreground"
            >
              Waktu menggunakan zona WIB (UTC+07:00).
            </p>

            <FieldError formId={formId} field="scheduledAt" errors={errors} />
          </div>
        ) : (
          <input type="hidden" name="scheduledAt" value="" />
        )}
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-4 font-medium">Pengaturan SEO</p>

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-seoTitle`}>Judul SEO</Label>

            <Input
              id={`${formId}-seoTitle`}
              name="seoTitle"
              defaultValue={values.seoTitle}
              placeholder="Kosongkan untuk menggunakan judul berita"
              maxLength={180}
              disabled={disabled}
              aria-invalid={Boolean(errors?.seoTitle?.length)}
              aria-describedby={getErrorId(formId, "seoTitle", errors)}
            />

            <FieldError formId={formId} field="seoTitle" errors={errors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-seoDescription`}>Deskripsi SEO</Label>

            <Textarea
              id={`${formId}-seoDescription`}
              name="seoDescription"
              defaultValue={values.seoDescription}
              placeholder="Deskripsi singkat untuk mesin pencari."
              rows={3}
              maxLength={320}
              disabled={disabled}
              aria-invalid={Boolean(errors?.seoDescription?.length)}
              aria-describedby={getErrorId(formId, "seoDescription", errors)}
            />

            <FieldError
              formId={formId}
              field="seoDescription"
              errors={errors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
