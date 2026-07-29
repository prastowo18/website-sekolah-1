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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  announcementPriorities,
  announcementPriorityLabels,
  type AnnouncementPriorityValue,
} from "@/features/announcement/constants";
import type { AnnouncementFieldName } from "@/features/announcement/types";

export type AnnouncementFormValues = {
  title: string;
  slug: string;
  content: string;
  priority: AnnouncementPriorityValue;
  attachmentUrl: string;
  startDate: string;
  endDate: string;
  isPinned: boolean;
  isActive: boolean;
};

type AnnouncementFieldErrors = Partial<Record<AnnouncementFieldName, string[]>>;

type AnnouncementFormFieldsProps = {
  formId: string;
  values: AnnouncementFormValues;
  errors?: AnnouncementFieldErrors;
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

  const wibDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return wibDate.toISOString().slice(0, 16);
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
  field: AnnouncementFieldName;
  errors?: AnnouncementFieldErrors;
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
  field: AnnouncementFieldName,
  errors?: AnnouncementFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function AnnouncementFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: AnnouncementFormFieldsProps) {
  const [priority, setPriority] = useState<AnnouncementPriorityValue>(
    values.priority,
  );

  const [startDate, setStartDate] = useState(() =>
    isoToWibLocal(values.startDate),
  );

  const [endDate, setEndDate] = useState(() => isoToWibLocal(values.endDate));

  const [isPinned, setIsPinned] = useState(values.isPinned);

  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-title`}>Judul pengumuman</Label>

        <Input
          id={`${formId}-title`}
          name="title"
          defaultValue={values.title}
          placeholder="Masukkan judul pengumuman"
          maxLength={220}
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
            maxLength={240}
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
            Kosongkan agar slug dibuat otomatis dari judul pengumuman.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-priority`}>Prioritas</Label>

          <input type="hidden" name="priority" value={priority} />

          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value as AnnouncementPriorityValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-priority`}
              className="w-full"
              aria-invalid={Boolean(errors?.priority?.length)}
              aria-describedby={getErrorId(formId, "priority", errors)}
            >
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>

            <SelectContent>
              {announcementPriorities.map((item) => (
                <SelectItem key={item} value={item}>
                  {announcementPriorityLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="priority" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-content`}>Isi pengumuman</Label>

        <Textarea
          id={`${formId}-content`}
          name="content"
          defaultValue={values.content}
          placeholder="Tuliskan isi pengumuman secara lengkap."
          rows={10}
          maxLength={100000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.content?.length)}
          aria-describedby={getErrorId(formId, "content", errors)}
          required
        />

        <FieldError formId={formId} field="content" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-attachmentUrl`}>URL lampiran</Label>

        <Input
          id={`${formId}-attachmentUrl`}
          name="attachmentUrl"
          defaultValue={values.attachmentUrl}
          placeholder="https://... atau /dokumen/..."
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.attachmentUrl?.length)}
          aria-describedby={
            errors?.attachmentUrl?.length
              ? `${formId}-attachmentUrl-error`
              : `${formId}-attachmentUrl-help`
          }
        />

        <p
          id={`${formId}-attachmentUrl-help`}
          className="text-xs text-muted-foreground"
        >
          Dapat berupa dokumen, formulir, atau tautan informasi tambahan.
        </p>

        <FieldError formId={formId} field="attachmentUrl" errors={errors} />
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">Periode tayang</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Kosongkan waktu mulai agar pengumuman dapat tampil segera. Kosongkan
          waktu selesai agar tidak memiliki batas akhir. Waktu menggunakan WIB.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-startDate`}>Mulai tayang</Label>

            <input
              type="hidden"
              name="startDate"
              value={wibLocalToIso(startDate)}
            />

            <Input
              id={`${formId}-startDate`}
              type="datetime-local"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
              }}
              disabled={disabled}
              aria-invalid={Boolean(errors?.startDate?.length)}
              aria-describedby={getErrorId(formId, "startDate", errors)}
            />

            <FieldError formId={formId} field="startDate" errors={errors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-endDate`}>Selesai tayang</Label>

            <input
              type="hidden"
              name="endDate"
              value={wibLocalToIso(endDate)}
            />

            <Input
              id={`${formId}-endDate`}
              type="datetime-local"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
              }}
              disabled={disabled}
              aria-invalid={Boolean(errors?.endDate?.length)}
              aria-describedby={getErrorId(formId, "endDate", errors)}
            />

            <FieldError formId={formId} field="endDate" errors={errors} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isPinned`}>Sematkan pengumuman</Label>

            <p className="text-xs text-muted-foreground">
              Pengumuman disematkan tampil lebih menonjol pada daftar.
            </p>
          </div>

          <input
            type="hidden"
            name="isPinned"
            value={isPinned ? "true" : "false"}
          />

          <Switch
            id={`${formId}-isPinned`}
            checked={isPinned}
            onCheckedChange={setIsPinned}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isActive`}>Pengumuman aktif</Label>

            <p className="text-xs text-muted-foreground">
              Hanya pengumuman aktif yang dapat ditampilkan pada website publik.
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
    </div>
  );
}
