"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TeacherFieldName } from "@/features/teacher/types";

import { TeacherPhotoField } from "./teacher-photo-field";

export type TeacherFormValues = {
  name: string;
  slug: string;
  employeeNumber: string;
  position: string;
  subject: string;
  education: string;
  shortBiography: string;
  photoUrl: string;
  sortOrder: number;
  isPrincipal: boolean;
  isActive: boolean;
};

type TeacherFieldErrors = Partial<Record<TeacherFieldName, string[]>>;

type TeacherFormFieldsProps = {
  formId: string;
  values: TeacherFormValues;
  errors?: TeacherFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: TeacherFieldName;
  errors?: TeacherFieldErrors;
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
  field: TeacherFieldName,
  errors?: TeacherFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function TeacherFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: TeacherFormFieldsProps) {
  const [isPrincipal, setIsPrincipal] = useState(values.isPrincipal);
  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-name`}>Nama guru</Label>

        <Input
          id={`${formId}-name`}
          name="name"
          defaultValue={values.name}
          placeholder="Masukkan nama lengkap guru"
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
          placeholder="Otomatis dari nama guru"
          maxLength={180}
          disabled={disabled}
          aria-invalid={Boolean(errors?.slug?.length)}
          aria-describedby={
            errors?.slug?.length
              ? `${formId}-slug-error`
              : `${formId}-slug-help`
          }
        />

        <p id={`${formId}-slug-help`} className="text-xs text-muted-foreground">
          Kosongkan agar slug dibuat otomatis dari nama guru.
        </p>

        <FieldError formId={formId} field="slug" errors={errors} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-employeeNumber`}>Nomor pegawai</Label>

          <Input
            id={`${formId}-employeeNumber`}
            name="employeeNumber"
            defaultValue={values.employeeNumber}
            placeholder="NIP, NUPTK, atau nomor internal"
            maxLength={50}
            disabled={disabled}
            aria-invalid={Boolean(errors?.employeeNumber?.length)}
            aria-describedby={getErrorId(formId, "employeeNumber", errors)}
          />

          <FieldError formId={formId} field="employeeNumber" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-position`}>Jabatan</Label>

          <Input
            id={`${formId}-position`}
            name="position"
            defaultValue={values.position}
            placeholder="Contoh: Wali Kelas VI"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.position?.length)}
            aria-describedby={getErrorId(formId, "position", errors)}
          />

          <FieldError formId={formId} field="position" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-subject`}>
            Mata pelajaran atau bidang
          </Label>

          <Input
            id={`${formId}-subject`}
            name="subject"
            defaultValue={values.subject}
            placeholder="Contoh: Matematika"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.subject?.length)}
            aria-describedby={getErrorId(formId, "subject", errors)}
          />

          <FieldError formId={formId} field="subject" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-education`}>Pendidikan</Label>

          <Input
            id={`${formId}-education`}
            name="education"
            defaultValue={values.education}
            placeholder="Contoh: S1 Pendidikan Guru SD"
            maxLength={180}
            disabled={disabled}
            aria-invalid={Boolean(errors?.education?.length)}
            aria-describedby={getErrorId(formId, "education", errors)}
          />

          <FieldError formId={formId} field="education" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-shortBiography`}>Biografi singkat</Label>

        <Textarea
          id={`${formId}-shortBiography`}
          name="shortBiography"
          defaultValue={values.shortBiography}
          placeholder="Tuliskan pengalaman, keahlian, atau profil singkat."
          rows={6}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.shortBiography?.length)}
          aria-describedby={getErrorId(formId, "shortBiography", errors)}
        />

        <FieldError formId={formId} field="shortBiography" errors={errors} />
      </div>

      <TeacherPhotoField
        formId={formId}
        initialValue={values.photoUrl}
        error={errors?.photoUrl?.[0]}
        disabled={disabled}
      />

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

      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isActive`}>Guru aktif</Label>

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

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isPrincipal`}>Kepala sekolah</Label>

            <p className="text-xs text-muted-foreground">
              Jika diaktifkan, kepala sekolah sebelumnya akan dilepas otomatis.
            </p>
          </div>

          <input
            type="hidden"
            name="isPrincipal"
            value={isPrincipal ? "true" : "false"}
          />

          <Switch
            id={`${formId}-isPrincipal`}
            checked={isPrincipal}
            onCheckedChange={setIsPrincipal}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
