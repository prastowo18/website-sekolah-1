import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostCategoryFieldName } from "@/features/post-category/types";

export type PostCategoryFormValues = {
  name: string;
  slug: string;
  description: string;
};

type PostCategoryFieldErrors = Partial<Record<PostCategoryFieldName, string[]>>;

type PostCategoryFormFieldsProps = {
  formId: string;
  values: PostCategoryFormValues;
  errors?: PostCategoryFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: PostCategoryFieldName;
  errors?: PostCategoryFieldErrors;
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
  field: PostCategoryFieldName,
  errors?: PostCategoryFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function PostCategoryFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: PostCategoryFormFieldsProps) {
  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-name`}>Nama kategori</Label>

        <Input
          id={`${formId}-name`}
          name="name"
          defaultValue={values.name}
          placeholder="Contoh: Kegiatan Sekolah"
          maxLength={120}
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
          placeholder="Otomatis dari nama kategori"
          maxLength={140}
          disabled={disabled}
          aria-invalid={Boolean(errors?.slug?.length)}
          aria-describedby={
            errors?.slug?.length
              ? `${formId}-slug-error`
              : `${formId}-slug-help`
          }
        />

        <p id={`${formId}-slug-help`} className="text-xs text-muted-foreground">
          Kosongkan agar slug dibuat otomatis dari nama kategori.
        </p>

        <FieldError formId={formId} field="slug" errors={errors} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Jelaskan jenis berita yang termasuk dalam kategori ini."
          rows={5}
          maxLength={10000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, "description", errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>
    </div>
  );
}
