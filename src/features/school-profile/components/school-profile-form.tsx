'use client';

import { useActionToast } from '@/hooks/use-action-toast';
import { useActionState } from 'react';
import type { ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { updateSchoolProfileAction } from '@/features/school-profile/actions';
import { SchoolProfileMediaFields } from './school-profile-media-fields';
import {
  initialSchoolProfileActionState,
  type SchoolProfileFieldName,
} from '@/features/school-profile/types';

type SchoolProfileFormData = {
  schoolName: string;
  shortName: string | null;
  npsn: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;
  principalPhotoUrl: string | null;
  tagline: string | null;
  shortDescription: string | null;
  history: string | null;
  vision: string | null;
  mission: string[];
  goals: string[];
  schoolValues: string[];
  accreditation: string | null;
  foundedYear: number | null;
  principalName: string | null;
  principalTitle: string | null;
  principalGreeting: string | null;
  address: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  operationalHours: string | null;
};

type SchoolProfileFormProps = {
  profile: SchoolProfileFormData;
  canEdit: boolean;
};

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

type FieldErrorProps = {
  field: SchoolProfileFieldName | undefined;
  errors: Partial<Record<SchoolProfileFieldName, string[]>> | undefined;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">{children}</CardContent>
    </Card>
  );
}

function FieldError({ field, errors }: FieldErrorProps) {
  if (!field) {
    return null;
  }

  const message = errors?.[field]?.[0];

  if (!message) {
    return null;
  }

  return (
    <p id={`${field}-error`} className="text-sm text-destructive">
      {message}
    </p>
  );
}

function getErrorDescription(
  field: SchoolProfileFieldName,
  hasError: boolean,
): string | undefined {
  return hasError ? `${field}-error` : undefined;
}

export function SchoolProfileForm({
  profile,
  canEdit,
}: SchoolProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSchoolProfileAction,
    initialSchoolProfileActionState,
  );

  useActionToast(state);

  function hasError(field: SchoolProfileFieldName): boolean {
    return Boolean(state.fieldErrors?.[field]?.length);
  }

  const disabled = !canEdit || isPending;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {!canEdit ? (
        <Alert>
          <AlertTitle>Mode hanya lihat</AlertTitle>

          <AlertDescription>
            Role Viewer dapat melihat profil sekolah, tetapi tidak dapat
            mengubahnya.
          </AlertDescription>
        </Alert>
      ) : null}

      {state.message ? (
        <Alert
          variant={state.status === 'error' ? 'destructive' : 'default'}
          role="status"
        >
          <AlertTitle>
            {state.status === 'success' ? 'Berhasil' : 'Data belum tersimpan'}
          </AlertTitle>

          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FormSection
        title="Identitas sekolah"
        description="Informasi utama yang digunakan pada website publik dan metadata sekolah."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="schoolName">Nama resmi sekolah</Label>

            <Input
              id="schoolName"
              name="schoolName"
              defaultValue={profile.schoolName}
              placeholder="Contoh: SD Negeri 01"
              maxLength={180}
              disabled={disabled}
              aria-invalid={hasError('schoolName')}
              aria-describedby={getErrorDescription(
                'schoolName',
                hasError('schoolName'),
              )}
              required
            />

            <FieldError field="schoolName" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Nama singkat</Label>

            <Input
              id="shortName"
              name="shortName"
              defaultValue={profile.shortName ?? ''}
              placeholder="Contoh: SDN 01"
              maxLength={80}
              disabled={disabled}
              aria-invalid={hasError('shortName')}
              aria-describedby={getErrorDescription(
                'shortName',
                hasError('shortName'),
              )}
            />

            <FieldError field="shortName" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="npsn">NPSN</Label>

            <Input
              id="npsn"
              name="npsn"
              defaultValue={profile.npsn ?? ''}
              placeholder="Masukkan NPSN"
              inputMode="numeric"
              maxLength={20}
              disabled={disabled}
              aria-invalid={hasError('npsn')}
              aria-describedby={getErrorDescription('npsn', hasError('npsn'))}
            />

            <FieldError field="npsn" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accreditation">Akreditasi</Label>

            <Input
              id="accreditation"
              name="accreditation"
              defaultValue={profile.accreditation ?? ''}
              placeholder="Contoh: A"
              maxLength={50}
              disabled={disabled}
              aria-invalid={hasError('accreditation')}
              aria-describedby={getErrorDescription(
                'accreditation',
                hasError('accreditation'),
              )}
            />

            <FieldError field="accreditation" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="foundedYear">Tahun berdiri</Label>

            <Input
              id="foundedYear"
              name="foundedYear"
              type="number"
              defaultValue={profile.foundedYear ?? ''}
              min={1800}
              max={new Date().getFullYear()}
              placeholder="Contoh: 1985"
              disabled={disabled}
              aria-invalid={hasError('foundedYear')}
              aria-describedby={getErrorDescription(
                'foundedYear',
                hasError('foundedYear'),
              )}
            />

            <FieldError field="foundedYear" errors={state.fieldErrors} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Slogan atau tagline</Label>

          <Input
            id="tagline"
            name="tagline"
            defaultValue={profile.tagline ?? ''}
            placeholder="Slogan singkat sekolah"
            maxLength={220}
            disabled={disabled}
            aria-invalid={hasError('tagline')}
            aria-describedby={getErrorDescription(
              'tagline',
              hasError('tagline'),
            )}
          />

          <FieldError field="tagline" errors={state.fieldErrors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Deskripsi singkat</Label>

          <Textarea
            id="shortDescription"
            name="shortDescription"
            defaultValue={profile.shortDescription ?? ''}
            placeholder="Ringkasan sekolah untuk beranda dan hasil pencarian."
            rows={4}
            maxLength={2000}
            disabled={disabled}
            aria-invalid={hasError('shortDescription')}
            aria-describedby={getErrorDescription(
              'shortDescription',
              hasError('shortDescription'),
            )}
          />

          <FieldError field="shortDescription" errors={state.fieldErrors} />
        </div>
      </FormSection>

      <FormSection
        title="Profil dan arah pendidikan"
        description="Sejarah, visi, misi, tujuan, dan nilai utama sekolah."
      >
        <div className="space-y-2">
          <Label htmlFor="history">Sejarah sekolah</Label>

          <Textarea
            id="history"
            name="history"
            defaultValue={profile.history ?? ''}
            placeholder="Tuliskan sejarah singkat sekolah."
            rows={7}
            maxLength={20000}
            disabled={disabled}
            aria-invalid={hasError('history')}
            aria-describedby={getErrorDescription(
              'history',
              hasError('history'),
            )}
          />

          <FieldError field="history" errors={state.fieldErrors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vision">Visi</Label>

          <Textarea
            id="vision"
            name="vision"
            defaultValue={profile.vision ?? ''}
            placeholder="Tuliskan visi sekolah."
            rows={4}
            maxLength={5000}
            disabled={disabled}
            aria-invalid={hasError('vision')}
            aria-describedby={getErrorDescription('vision', hasError('vision'))}
          />

          <FieldError field="vision" errors={state.fieldErrors} />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="mission">Misi</Label>

            <Textarea
              id="mission"
              name="mission"
              defaultValue={profile.mission.join('\n')}
              placeholder={
                'Satu misi per baris\nContoh:\nMeningkatkan kualitas pembelajaran\nMembangun karakter siswa'
              }
              rows={9}
              maxLength={10000}
              disabled={disabled}
              aria-invalid={hasError('mission')}
              aria-describedby={
                hasError('mission') ? 'mission-error' : 'mission-help'
              }
            />

            <p id="mission-help" className="text-xs text-muted-foreground">
              Tulis satu butir misi pada setiap baris.
            </p>

            <FieldError field="mission" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Tujuan</Label>

            <Textarea
              id="goals"
              name="goals"
              defaultValue={profile.goals.join('\n')}
              placeholder="Satu tujuan per baris"
              rows={9}
              maxLength={10000}
              disabled={disabled}
              aria-invalid={hasError('goals')}
              aria-describedby={
                hasError('goals') ? 'goals-error' : 'goals-help'
              }
            />

            <p id="goals-help" className="text-xs text-muted-foreground">
              Tulis satu tujuan pada setiap baris.
            </p>

            <FieldError field="goals" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolValues">Nilai sekolah</Label>

            <Textarea
              id="schoolValues"
              name="schoolValues"
              defaultValue={profile.schoolValues.join('\n')}
              placeholder="Satu nilai pada setiap baris"
              rows={9}
              maxLength={10000}
              disabled={disabled}
              aria-invalid={hasError('schoolValues')}
              aria-describedby={
                hasError('schoolValues')
                  ? 'schoolValues-error'
                  : 'schoolValues-help'
              }
            />

            <p id="schoolValues-help" className="text-xs text-muted-foreground">
              Contoh: Integritas, disiplin, peduli, dan berprestasi.
            </p>

            <FieldError field="schoolValues" errors={state.fieldErrors} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Kepala sekolah"
        description="Identitas dan sambutan kepala sekolah yang akan ditampilkan pada website publik."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="principalName">Nama kepala sekolah</Label>

            <Input
              id="principalName"
              name="principalName"
              defaultValue={profile.principalName ?? ''}
              placeholder="Nama lengkap"
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('principalName')}
              aria-describedby={getErrorDescription(
                'principalName',
                hasError('principalName'),
              )}
            />

            <FieldError field="principalName" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="principalTitle">Jabatan</Label>

            <Input
              id="principalTitle"
              name="principalTitle"
              defaultValue={profile.principalTitle ?? ''}
              placeholder="Contoh: Kepala Sekolah"
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('principalTitle')}
              aria-describedby={getErrorDescription(
                'principalTitle',
                hasError('principalTitle'),
              )}
            />

            <FieldError field="principalTitle" errors={state.fieldErrors} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principalGreeting">Sambutan kepala sekolah</Label>

          <Textarea
            id="principalGreeting"
            name="principalGreeting"
            defaultValue={profile.principalGreeting ?? ''}
            placeholder="Tuliskan sambutan kepala sekolah."
            rows={8}
            maxLength={10000}
            disabled={disabled}
            aria-invalid={hasError('principalGreeting')}
            aria-describedby={getErrorDescription(
              'principalGreeting',
              hasError('principalGreeting'),
            )}
          />

          <FieldError field="principalGreeting" errors={state.fieldErrors} />
        </div>
      </FormSection>

      <FormSection
        title="Alamat dan wilayah"
        description="Alamat lengkap sekolah untuk halaman kontak dan informasi lokasi."
      >
        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>

          <Textarea
            id="address"
            name="address"
            defaultValue={profile.address ?? ''}
            placeholder="Nama jalan, nomor, dan keterangan alamat."
            rows={4}
            maxLength={2000}
            disabled={disabled}
            aria-invalid={hasError('address')}
            aria-describedby={getErrorDescription(
              'address',
              hasError('address'),
            )}
          />

          <FieldError field="address" errors={state.fieldErrors} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="village">Desa/Kelurahan</Label>

            <Input
              id="village"
              name="village"
              defaultValue={profile.village ?? ''}
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('village')}
              aria-describedby={getErrorDescription(
                'village',
                hasError('village'),
              )}
            />

            <FieldError field="village" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">Kecamatan</Label>

            <Input
              id="district"
              name="district"
              defaultValue={profile.district ?? ''}
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('district')}
              aria-describedby={getErrorDescription(
                'district',
                hasError('district'),
              )}
            />

            <FieldError field="district" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Kabupaten/Kota</Label>

            <Input
              id="city"
              name="city"
              defaultValue={profile.city ?? ''}
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('city')}
              aria-describedby={getErrorDescription('city', hasError('city'))}
            />

            <FieldError field="city" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Provinsi</Label>

            <Input
              id="province"
              name="province"
              defaultValue={profile.province ?? ''}
              maxLength={120}
              disabled={disabled}
              aria-invalid={hasError('province')}
              aria-describedby={getErrorDescription(
                'province',
                hasError('province'),
              )}
            />

            <FieldError field="province" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Kode pos</Label>

            <Input
              id="postalCode"
              name="postalCode"
              defaultValue={profile.postalCode ?? ''}
              inputMode="numeric"
              maxLength={10}
              disabled={disabled}
              aria-invalid={hasError('postalCode')}
              aria-describedby={getErrorDescription(
                'postalCode',
                hasError('postalCode'),
              )}
            />

            <FieldError field="postalCode" errors={state.fieldErrors} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Kontak sekolah"
        description="Kontak resmi yang dapat diakses oleh pengunjung website."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>

            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ''}
              placeholder="Contoh: 0752 123456"
              maxLength={30}
              disabled={disabled}
              aria-invalid={hasError('phone')}
              aria-describedby={getErrorDescription('phone', hasError('phone'))}
            />

            <FieldError field="phone" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>

            <Input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              defaultValue={profile.whatsapp ?? ''}
              placeholder="Contoh: 081234567890"
              maxLength={30}
              disabled={disabled}
              aria-invalid={hasError('whatsapp')}
              aria-describedby={getErrorDescription(
                'whatsapp',
                hasError('whatsapp'),
              )}
            />

            <FieldError field="whatsapp" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={profile.email ?? ''}
              placeholder="sekolah@example.com"
              maxLength={180}
              disabled={disabled}
              aria-invalid={hasError('email')}
              aria-describedby={getErrorDescription('email', hasError('email'))}
            />

            <FieldError field="email" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationalHours">Jam layanan</Label>

            <Input
              id="operationalHours"
              name="operationalHours"
              defaultValue={profile.operationalHours ?? ''}
              placeholder="Senin–Jumat, 08.00–15.00"
              maxLength={180}
              disabled={disabled}
              aria-invalid={hasError('operationalHours')}
              aria-describedby={getErrorDescription(
                'operationalHours',
                hasError('operationalHours'),
              )}
            />

            <FieldError field="operationalHours" errors={state.fieldErrors} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Media dan identitas visual"
        description="Kelola logo, favicon, gambar utama, dan foto kepala sekolah yang digunakan pada website publik."
      >
        <SchoolProfileMediaFields
          values={{
            logoUrl: profile.logoUrl,
            faviconUrl: profile.faviconUrl,
            heroImageUrl: profile.heroImageUrl,
            principalPhotoUrl: profile.principalPhotoUrl,
          }}
          errors={state.fieldErrors}
          disabled={disabled}
        />
      </FormSection>

      {canEdit ? (
        <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Menyimpan...
              </>
            ) : (
              'Simpan perubahan'
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
