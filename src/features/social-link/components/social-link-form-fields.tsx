"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { socialLinkPlatformSuggestions } from "@/features/social-link/constants";
import type { SocialLinkFieldName } from "@/features/social-link/types";

export type SocialLinkFormValues = {
  platform: string;
  label: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
};

type SocialLinkFieldErrors = Partial<Record<SocialLinkFieldName, string[]>>;

type SocialLinkFormFieldsProps = {
  formId: string;
  values: SocialLinkFormValues;
  errors?: SocialLinkFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: SocialLinkFieldName;
  errors?: SocialLinkFieldErrors;
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

function getDescriptionId(
  formId: string,
  field: SocialLinkFieldName,
  errors?: SocialLinkFieldErrors,
): string {
  return errors?.[field]?.length
    ? `${formId}-${field}-error`
    : `${formId}-${field}-help`;
}

export function SocialLinkFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: SocialLinkFormFieldsProps) {
  const [isActive, setIsActive] = useState(values.isActive);

  const platformListId = `${formId}-platform-options`;

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-platform`}>Platform</Label>

          <Input
            id={`${formId}-platform`}
            name="platform"
            defaultValue={values.platform}
            list={platformListId}
            placeholder="Contoh: INSTAGRAM"
            maxLength={50}
            disabled={disabled}
            aria-invalid={Boolean(errors?.platform?.length)}
            aria-describedby={getDescriptionId(formId, "platform", errors)}
            required
          />

          <datalist id={platformListId}>
            {socialLinkPlatformSuggestions.map((platform) => (
              <option key={platform} value={platform} />
            ))}
          </datalist>

          <p
            id={`${formId}-platform-help`}
            className="text-xs leading-5 text-muted-foreground"
          >
            Gunakan satu platform satu kali. Nama akan disimpan menggunakan
            huruf kapital.
          </p>

          <FieldError formId={formId} field="platform" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-label`}>Label tampilan</Label>

          <Input
            id={`${formId}-label`}
            name="label"
            defaultValue={values.label}
            placeholder="Contoh: Instagram Sekolah"
            maxLength={80}
            disabled={disabled}
            aria-invalid={Boolean(errors?.label?.length)}
            aria-describedby={getDescriptionId(formId, "label", errors)}
          />

          <p
            id={`${formId}-label-help`}
            className="text-xs leading-5 text-muted-foreground"
          >
            Opsional. Nama platform digunakan apabila label dikosongkan.
          </p>

          <FieldError formId={formId} field="label" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-url`}>URL akun atau halaman</Label>

        <Input
          id={`${formId}-url`}
          name="url"
          type="url"
          defaultValue={values.url}
          placeholder="https://www.instagram.com/nama-sekolah"
          maxLength={4000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.url?.length)}
          aria-describedby={getDescriptionId(formId, "url", errors)}
          required
        />

        <p
          id={`${formId}-url-help`}
          className="text-xs leading-5 text-muted-foreground"
        >
          URL wajib menggunakan HTTPS dan akan dibuka pada tab baru.
        </p>

        <FieldError formId={formId} field="url" errors={errors} />
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
          aria-describedby={getDescriptionId(formId, "sortOrder", errors)}
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

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isActive`}>Media sosial aktif</Label>

          <p className="text-xs leading-5 text-muted-foreground">
            Hanya media sosial aktif yang tampil pada website publik.
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
