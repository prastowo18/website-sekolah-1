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
  ppdbStatusLabels,
  ppdbStatuses,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";
import type { PpdbInformationFieldName } from "@/features/ppdb/types";

export type PpdbInformationFormValues = {
  title: string;
  academicYear: string;
  status: PpdbStatusValue;
  shortDescription: string;
  description: string;
  quota: number | null;
  brochureUrl: string;
  externalRegistrationUrl: string;
  registrationLocation: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  serviceHours: string;
  scholarshipInformation: string;
  showFee: boolean;
  showExternalRegistrationButton: boolean;
  isActive: boolean;
};

type FieldErrors = Partial<Record<PpdbInformationFieldName, string[]>>;

type PpdbInformationFormFieldsProps = {
  formId: string;
  values: PpdbInformationFormValues;
  errors?: FieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: PpdbInformationFieldName;
  errors?: FieldErrors;
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
  field: PpdbInformationFieldName,
  errors?: FieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function PpdbInformationFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: PpdbInformationFormFieldsProps) {
  const [status, setStatus] = useState<PpdbStatusValue>(values.status);

  const [showFee, setShowFee] = useState(values.showFee);

  const [showExternalRegistrationButton, setShowExternalRegistrationButton] =
    useState(values.showExternalRegistrationButton);

  const [isActive, setIsActive] = useState(values.isActive);

  return (
    <div className="grid gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-title`}>Judul informasi PPDB</Label>

          <Input
            id={`${formId}-title`}
            name="title"
            defaultValue={values.title}
            placeholder="Contoh: Penerimaan Peserta Didik Baru"
            maxLength={220}
            disabled={disabled}
            aria-invalid={Boolean(errors?.title?.length)}
            aria-describedby={getErrorId(formId, "title", errors)}
            required
          />

          <FieldError formId={formId} field="title" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-academicYear`}>Tahun ajaran</Label>

          <Input
            id={`${formId}-academicYear`}
            name="academicYear"
            defaultValue={values.academicYear}
            placeholder="Contoh: 2026/2027"
            maxLength={20}
            disabled={disabled}
            aria-invalid={Boolean(errors?.academicYear?.length)}
            aria-describedby={getErrorId(formId, "academicYear", errors)}
            required
          />

          <FieldError formId={formId} field="academicYear" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-status`}>Status PPDB</Label>

          <input type="hidden" name="status" value={status} />

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as PpdbStatusValue);
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
              {ppdbStatuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {ppdbStatusLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="status" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-quota`}>Kuota siswa</Label>

          <Input
            id={`${formId}-quota`}
            name="quota"
            type="number"
            defaultValue={values.quota ?? ""}
            placeholder="Kosongkan jika belum ditentukan"
            min={0}
            max={100000}
            step={1}
            disabled={disabled}
            aria-invalid={Boolean(errors?.quota?.length)}
            aria-describedby={getErrorId(formId, "quota", errors)}
          />

          <FieldError formId={formId} field="quota" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-shortDescription`}>Deskripsi singkat</Label>

        <Textarea
          id={`${formId}-shortDescription`}
          name="shortDescription"
          defaultValue={values.shortDescription}
          placeholder="Ringkasan singkat informasi PPDB."
          rows={3}
          maxLength={360}
          disabled={disabled}
          aria-invalid={Boolean(errors?.shortDescription?.length)}
          aria-describedby={getErrorId(formId, "shortDescription", errors)}
        />

        <FieldError formId={formId} field="shortDescription" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi lengkap</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Tuliskan informasi umum PPDB secara lengkap."
          rows={8}
          maxLength={50000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">Brosur dan pendaftaran eksternal</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Website hanya menampilkan informasi. Tautan pendaftaran eksternal
          bersifat opsional dan tidak menyimpan data calon siswa pada sistem
          ini.
        </p>

        <div className="mt-4 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-brochureUrl`}>URL brosur</Label>

            <Input
              id={`${formId}-brochureUrl`}
              name="brochureUrl"
              defaultValue={values.brochureUrl}
              placeholder="https://... atau /dokumen/..."
              maxLength={4000}
              disabled={disabled}
              aria-invalid={Boolean(errors?.brochureUrl?.length)}
              aria-describedby={getErrorId(formId, "brochureUrl", errors)}
            />

            <FieldError formId={formId} field="brochureUrl" errors={errors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-externalRegistrationUrl`}>
              URL pendaftaran eksternal
            </Label>

            <Input
              id={`${formId}-externalRegistrationUrl`}
              name="externalRegistrationUrl"
              type="url"
              defaultValue={values.externalRegistrationUrl}
              placeholder="https://..."
              maxLength={4000}
              disabled={disabled}
              aria-invalid={Boolean(errors?.externalRegistrationUrl?.length)}
              aria-describedby={getErrorId(
                formId,
                "externalRegistrationUrl",
                errors,
              )}
            />

            <FieldError
              formId={formId}
              field="externalRegistrationUrl"
              errors={errors}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="font-medium">Lokasi dan kontak</p>

        <div className="mt-4 grid gap-5">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-registrationLocation`}>
              Lokasi pendaftaran atau pelayanan
            </Label>

            <Textarea
              id={`${formId}-registrationLocation`}
              name="registrationLocation"
              defaultValue={values.registrationLocation}
              placeholder="Alamat atau lokasi pelayanan PPDB."
              rows={4}
              maxLength={10000}
              disabled={disabled}
              aria-invalid={Boolean(errors?.registrationLocation?.length)}
              aria-describedby={getErrorId(
                formId,
                "registrationLocation",
                errors,
              )}
            />

            <FieldError
              formId={formId}
              field="registrationLocation"
              errors={errors}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-contactPerson`}>Nama kontak</Label>

              <Input
                id={`${formId}-contactPerson`}
                name="contactPerson"
                defaultValue={values.contactPerson}
                placeholder="Nama petugas atau panitia"
                maxLength={160}
                disabled={disabled}
                aria-invalid={Boolean(errors?.contactPerson?.length)}
                aria-describedby={getErrorId(formId, "contactPerson", errors)}
              />

              <FieldError
                formId={formId}
                field="contactPerson"
                errors={errors}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-contactPhone`}>Nomor telepon</Label>

              <Input
                id={`${formId}-contactPhone`}
                name="contactPhone"
                type="tel"
                defaultValue={values.contactPhone}
                placeholder="Contoh: 081234567890"
                maxLength={30}
                disabled={disabled}
                aria-invalid={Boolean(errors?.contactPhone?.length)}
                aria-describedby={getErrorId(formId, "contactPhone", errors)}
              />

              <FieldError
                formId={formId}
                field="contactPhone"
                errors={errors}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-contactEmail`}>Email</Label>

              <Input
                id={`${formId}-contactEmail`}
                name="contactEmail"
                type="email"
                defaultValue={values.contactEmail}
                placeholder="ppdb@sekolah.sch.id"
                maxLength={180}
                disabled={disabled}
                aria-invalid={Boolean(errors?.contactEmail?.length)}
                aria-describedby={getErrorId(formId, "contactEmail", errors)}
              />

              <FieldError
                formId={formId}
                field="contactEmail"
                errors={errors}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-serviceHours`}>Jam pelayanan</Label>

              <Input
                id={`${formId}-serviceHours`}
                name="serviceHours"
                defaultValue={values.serviceHours}
                placeholder="Senin–Jumat, 08.00–14.00 WIB"
                maxLength={180}
                disabled={disabled}
                aria-invalid={Boolean(errors?.serviceHours?.length)}
                aria-describedby={getErrorId(formId, "serviceHours", errors)}
              />

              <FieldError
                formId={formId}
                field="serviceHours"
                errors={errors}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-scholarshipInformation`}>
          Informasi beasiswa atau keringanan
        </Label>

        <Textarea
          id={`${formId}-scholarshipInformation`}
          name="scholarshipInformation"
          defaultValue={values.scholarshipInformation}
          placeholder="Kosongkan jika tidak ada informasi beasiswa."
          rows={5}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.scholarshipInformation?.length)}
          aria-describedby={getErrorId(
            formId,
            "scholarshipInformation",
            errors,
          )}
        />

        <FieldError
          formId={formId}
          field="scholarshipInformation"
          errors={errors}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-showFee`}>Tampilkan biaya</Label>

            <p className="text-xs text-muted-foreground">
              Rincian biaya dapat dilihat publik.
            </p>
          </div>

          <input
            type="hidden"
            name="showFee"
            value={showFee ? "true" : "false"}
          />

          <Switch
            id={`${formId}-showFee`}
            checked={showFee}
            onCheckedChange={setShowFee}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-showExternalRegistrationButton`}>
              Tampilkan tombol eksternal
            </Label>

            <p className="text-xs text-muted-foreground">
              Tombol mengarah ke layanan lain.
            </p>
          </div>

          <input
            type="hidden"
            name="showExternalRegistrationButton"
            value={showExternalRegistrationButton ? "true" : "false"}
          />

          <Switch
            id={`${formId}-showExternalRegistrationButton`}
            checked={showExternalRegistrationButton}
            onCheckedChange={setShowExternalRegistrationButton}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor={`${formId}-isActive`}>Informasi aktif</Label>

            <p className="text-xs text-muted-foreground">
              Informasi dapat ditampilkan publik.
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
