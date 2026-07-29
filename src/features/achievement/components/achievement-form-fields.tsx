'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  achievementTypeLabels,
  achievementTypes,
  competitionLevelLabels,
  competitionLevels,
  type AchievementTypeValue,
  type CompetitionLevelValue,
} from '@/features/achievement/constants';
import type { AchievementFieldName } from '@/features/achievement/types';
import { useState } from 'react';
export type AchievementFormValues = {
  title: string;
  slug: string;
  achievementType: AchievementTypeValue;
  category: string;
  winnerName: string;
  competitionLevel: CompetitionLevelValue | '';
  rank: string;
  achievementDate: string;
  description: string;
  isPublished: boolean;
};

type AchievementFieldErrors = Partial<Record<AchievementFieldName, string[]>>;

type AchievementFormFieldsProps = {
  formId: string;
  values: AchievementFormValues;
  errors?: AchievementFieldErrors;
  disabled?: boolean;
};

function FieldError({
  formId,
  field,
  errors,
}: {
  formId: string;
  field: AchievementFieldName;
  errors?: AchievementFieldErrors;
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
  field: AchievementFieldName,
  errors?: AchievementFieldErrors,
): string | undefined {
  return errors?.[field]?.length ? `${formId}-${field}-error` : undefined;
}

export function AchievementFormFields({
  formId,
  values,
  errors,
  disabled = false,
}: AchievementFormFieldsProps) {
  const [achievementType, setAchievementType] = useState<AchievementTypeValue>(
    values.achievementType,
  );

  const [competitionLevel, setCompetitionLevel] = useState<
    CompetitionLevelValue | 'none'
  >(values.competitionLevel || 'none');

  const [isPublished, setIsPublished] = useState(values.isPublished);

  return (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor={`${formId}-title`}>Judul prestasi</Label>

        <Input
          id={`${formId}-title`}
          name="title"
          defaultValue={values.title}
          placeholder="Contoh: Juara 1 Olimpiade Matematika"
          maxLength={220}
          disabled={disabled}
          aria-invalid={Boolean(errors?.title?.length)}
          aria-describedby={getErrorId(formId, 'title', errors)}
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
            Kosongkan agar slug dibuat otomatis dari judul prestasi.
          </p>

          <FieldError formId={formId} field="slug" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-achievementType`}>Jenis prestasi</Label>

          <input type="hidden" name="achievementType" value={achievementType} />

          <Select
            value={achievementType}
            onValueChange={(value) => {
              setAchievementType(value as AchievementTypeValue);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-achievementType`}
              className="w-full"
              aria-invalid={Boolean(errors?.achievementType?.length)}
              aria-describedby={getErrorId(formId, 'achievementType', errors)}
            >
              <SelectValue placeholder="Pilih jenis prestasi" />
            </SelectTrigger>

            <SelectContent>
              {achievementTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {achievementTypeLabels[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError formId={formId} field="achievementType" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-category`}>Kategori</Label>

          <Input
            id={`${formId}-category`}
            name="category"
            defaultValue={values.category}
            placeholder="Contoh: Akademik"
            maxLength={120}
            disabled={disabled}
            aria-invalid={Boolean(errors?.category?.length)}
            aria-describedby={getErrorId(formId, 'category', errors)}
          />

          <FieldError formId={formId} field="category" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-winnerName`}>Nama penerima</Label>

          <Input
            id={`${formId}-winnerName`}
            name="winnerName"
            defaultValue={values.winnerName}
            placeholder="Nama siswa, guru, atau tim"
            maxLength={180}
            disabled={disabled}
            aria-invalid={Boolean(errors?.winnerName?.length)}
            aria-describedby={getErrorId(formId, 'winnerName', errors)}
          />

          <FieldError formId={formId} field="winnerName" errors={errors} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${formId}-competitionLevel`}>
            Tingkat kompetisi
          </Label>

          <input
            type="hidden"
            name="competitionLevel"
            value={competitionLevel === 'none' ? '' : competitionLevel}
          />

          <Select
            value={competitionLevel}
            onValueChange={(value) => {
              setCompetitionLevel(value as CompetitionLevelValue | 'none');
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${formId}-competitionLevel`}
              className="w-full"
              aria-invalid={Boolean(errors?.competitionLevel?.length)}
              aria-describedby={getErrorId(formId, 'competitionLevel', errors)}
            >
              <SelectValue placeholder="Pilih tingkat" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">Tidak ditentukan</SelectItem>

              {competitionLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {competitionLevelLabels[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError
            formId={formId}
            field="competitionLevel"
            errors={errors}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-rank`}>Peringkat</Label>

          <Input
            id={`${formId}-rank`}
            name="rank"
            defaultValue={values.rank}
            placeholder="Contoh: Juara 1"
            maxLength={80}
            disabled={disabled}
            aria-invalid={Boolean(errors?.rank?.length)}
            aria-describedby={getErrorId(formId, 'rank', errors)}
          />

          <FieldError formId={formId} field="rank" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${formId}-achievementDate`}>Tanggal prestasi</Label>

          <Input
            id={`${formId}-achievementDate`}
            name="achievementDate"
            type="date"
            defaultValue={values.achievementDate}
            disabled={disabled}
            aria-invalid={Boolean(errors?.achievementDate?.length)}
            aria-describedby={getErrorId(formId, 'achievementDate', errors)}
          />

          <FieldError formId={formId} field="achievementDate" errors={errors} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}-description`}>Deskripsi</Label>

        <Textarea
          id={`${formId}-description`}
          name="description"
          defaultValue={values.description}
          placeholder="Jelaskan kegiatan, penyelenggara, hasil, dan informasi prestasi."
          rows={7}
          maxLength={20000}
          disabled={disabled}
          aria-invalid={Boolean(errors?.description?.length)}
          aria-describedby={getErrorId(formId, 'description', errors)}
        />

        <FieldError formId={formId} field="description" errors={errors} />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor={`${formId}-isPublished`}>Publikasikan prestasi</Label>

          <p className="text-xs text-muted-foreground">
            Prestasi yang diterbitkan dapat ditampilkan pada website publik.
          </p>
        </div>

        <input
          type="hidden"
          name="isPublished"
          value={isPublished ? 'true' : 'false'}
        />

        <Switch
          id={`${formId}-isPublished`}
          checked={isPublished}
          onCheckedChange={setIsPublished}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
