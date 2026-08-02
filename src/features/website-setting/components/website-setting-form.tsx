"use client";

import { LoaderCircle, Save } from "lucide-react";
import {
  startTransition,
  type FormEvent,
  useActionState,
  useState,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateWebsiteSettingAction } from "@/features/website-setting/actions";
import {
  initialWebsiteSettingActionState,
  type WebsiteSettingFieldName,
  type WebsiteSettingValues,
} from "@/features/website-setting/types";

type WebsiteSettingFormProps = {
  settings: WebsiteSettingValues;
};

type FieldErrors = Partial<Record<WebsiteSettingFieldName, string[]>>;

const statisticFields = [
  {
    name: "homeStatsStudents" as const,
    label: "Jumlah siswa",
    help: "Diisi manual karena website belum memiliki modul data siswa.",
  },
  {
    name: "homeStatsTeachers" as const,
    label: "Jumlah guru",
    help: "Isi 0 untuk menggunakan jumlah guru aktif dari database.",
  },
  {
    name: "homeStatsPrograms" as const,
    label: "Jumlah program",
    help: "Isi 0 untuk menggunakan jumlah program aktif dari database.",
  },
  {
    name: "homeStatsAchievements" as const,
    label: "Jumlah prestasi",
    help: "Isi 0 untuk menggunakan jumlah prestasi aktif dari database.",
  },
];

function FieldError({
  field,
  errors,
}: {
  field: WebsiteSettingFieldName;
  errors?: FieldErrors;
}) {
  const messages = errors?.[field];

  if (!messages?.length) {
    return null;
  }

  return (
    <div id={`${field}-error`} className="space-y-1 text-sm text-destructive">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

function descriptionId(field: WebsiteSettingFieldName, errors?: FieldErrors) {
  return errors?.[field]?.length
    ? `${field}-help ${field}-error`
    : `${field}-help`;
}

export function WebsiteSettingForm({ settings }: WebsiteSettingFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateWebsiteSettingAction,
    initialWebsiteSettingActionState,
  );

  const [allowIndexing, setAllowIndexing] = useState(settings.allowIndexing);
  const [contactFormEnabled, setContactFormEnabled] = useState(
    settings.contactFormEnabled,
  );
  const [showFloatingWhatsapp, setShowFloatingWhatsapp] = useState(
    settings.showFloatingWhatsapp,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {state.status !== "idle" ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          <AlertTitle>
            {state.status === "error"
              ? "Pengaturan belum disimpan"
              : "Berhasil"}
          </AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Identitas SEO</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Metadata default digunakan ketika halaman tidak mempunyai metadata
            khusus.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="defaultTitle">Judul default website</Label>
            <Input
              id="defaultTitle"
              name="defaultTitle"
              defaultValue={settings.defaultTitle}
              maxLength={180}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.defaultTitle?.length)}
              aria-describedby={descriptionId(
                "defaultTitle",
                state.fieldErrors,
              )}
            />
            <p id="defaultTitle-help" className="text-xs text-muted-foreground">
              Contoh: SD Cendekia Nusantara — Sekolah Dasar Aktif dan
              Berkarakter.
            </p>
            <FieldError field="defaultTitle" errors={state.fieldErrors} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="defaultDescription">Deskripsi meta default</Label>
            <Textarea
              id="defaultDescription"
              name="defaultDescription"
              defaultValue={settings.defaultDescription}
              maxLength={320}
              rows={4}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.defaultDescription?.length,
              )}
              aria-describedby={descriptionId(
                "defaultDescription",
                state.fieldErrors,
              )}
            />
            <p
              id="defaultDescription-help"
              className="text-xs text-muted-foreground"
            >
              Ringkasan sekolah yang ditampilkan pada hasil pencarian dan
              preview tautan.
            </p>
            <FieldError field="defaultDescription" errors={state.fieldErrors} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keywords">Kata kunci</Label>
            <Textarea
              id="keywords"
              name="keywords"
              defaultValue={settings.keywords}
              maxLength={1_000}
              rows={3}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.keywords?.length)}
              aria-describedby={descriptionId("keywords", state.fieldErrors)}
            />
            <p id="keywords-help" className="text-xs text-muted-foreground">
              Pisahkan kata kunci dengan koma atau baris baru.
            </p>
            <FieldError field="keywords" errors={state.fieldErrors} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openGraphImageUrl">URL gambar Open Graph</Label>
            <Input
              id="openGraphImageUrl"
              name="openGraphImageUrl"
              type="text"
              defaultValue={settings.openGraphImageUrl}
              maxLength={4_000}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.openGraphImageUrl?.length,
              )}
              aria-describedby={descriptionId(
                "openGraphImageUrl",
                state.fieldErrors,
              )}
            />
            <p
              id="openGraphImageUrl-help"
              className="text-xs text-muted-foreground"
            >
              Gunakan URL HTTPS atau path lokal. Gambar digunakan saat tautan
              dibagikan.
            </p>
            <FieldError field="openGraphImageUrl" errors={state.fieldErrors} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="googleSiteVerification">
                Verifikasi Google Search Console
              </Label>
              <Input
                id="googleSiteVerification"
                name="googleSiteVerification"
                defaultValue={settings.googleSiteVerification}
                maxLength={200}
                disabled={isPending}
                aria-invalid={Boolean(
                  state.fieldErrors?.googleSiteVerification?.length,
                )}
                aria-describedby={descriptionId(
                  "googleSiteVerification",
                  state.fieldErrors,
                )}
              />
              <p
                id="googleSiteVerification-help"
                className="text-xs text-muted-foreground"
              >
                Masukkan nilai token saja, bukan seluruh tag HTML.
              </p>
              <FieldError
                field="googleSiteVerification"
                errors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="twitterHandle">Username X/Twitter</Label>
              <Input
                id="twitterHandle"
                name="twitterHandle"
                defaultValue={settings.twitterHandle}
                maxLength={16}
                placeholder="@namasekolah"
                disabled={isPending}
                aria-invalid={Boolean(state.fieldErrors?.twitterHandle?.length)}
                aria-describedby={descriptionId(
                  "twitterHandle",
                  state.fieldErrors,
                )}
              />
              <p
                id="twitterHandle-help"
                className="text-xs text-muted-foreground"
              >
                Opsional. Digunakan pada metadata Twitter Card.
              </p>
              <FieldError field="twitterHandle" errors={state.fieldErrors} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Beranda</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Atur label tombol hero dan statistik yang tampil pada halaman
            beranda.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="heroPrimaryCtaLabel">Label CTA utama</Label>
              <Input
                id="heroPrimaryCtaLabel"
                name="heroPrimaryCtaLabel"
                defaultValue={settings.heroPrimaryCtaLabel}
                maxLength={80}
                disabled={isPending}
                aria-invalid={Boolean(
                  state.fieldErrors?.heroPrimaryCtaLabel?.length,
                )}
                aria-describedby={descriptionId(
                  "heroPrimaryCtaLabel",
                  state.fieldErrors,
                )}
              />
              <p
                id="heroPrimaryCtaLabel-help"
                className="text-xs text-muted-foreground"
              >
                Tombol menuju halaman informasi PPDB.
              </p>
              <FieldError
                field="heroPrimaryCtaLabel"
                errors={state.fieldErrors}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="heroSecondaryCtaLabel">Label CTA kedua</Label>
              <Input
                id="heroSecondaryCtaLabel"
                name="heroSecondaryCtaLabel"
                defaultValue={settings.heroSecondaryCtaLabel}
                maxLength={80}
                disabled={isPending}
                aria-invalid={Boolean(
                  state.fieldErrors?.heroSecondaryCtaLabel?.length,
                )}
                aria-describedby={descriptionId(
                  "heroSecondaryCtaLabel",
                  state.fieldErrors,
                )}
              />
              <p
                id="heroSecondaryCtaLabel-help"
                className="text-xs text-muted-foreground"
              >
                Tombol menuju halaman profil sekolah.
              </p>
              <FieldError
                field="heroSecondaryCtaLabel"
                errors={state.fieldErrors}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statisticFields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={1_000_000}
                  step={1}
                  defaultValue={settings[field.name]}
                  disabled={isPending}
                  aria-invalid={Boolean(
                    state.fieldErrors?.[field.name]?.length,
                  )}
                  aria-describedby={descriptionId(
                    field.name,
                    state.fieldErrors,
                  )}
                />
                <p
                  id={`${field.name}-help`}
                  className="text-xs leading-5 text-muted-foreground"
                >
                  {field.help}
                </p>
                <FieldError field={field.name} errors={state.fieldErrors} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kontak dan Privasi</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Kontrol fitur kontak publik serta informasi penggunaan data
            pengunjung.
          </p>
        </CardHeader>

        <CardContent className="grid gap-6">
          <div className="flex items-start justify-between gap-5 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="contactFormEnabled">
                Aktifkan formulir kontak
              </Label>
              <p className="text-sm leading-6 text-muted-foreground">
                Saat dinonaktifkan, form disembunyikan dan Server Action menolak
                pesan baru.
              </p>
            </div>
            <input
              type="hidden"
              name="contactFormEnabled"
              value={contactFormEnabled ? "true" : "false"}
            />
            <Switch
              id="contactFormEnabled"
              checked={contactFormEnabled}
              onCheckedChange={setContactFormEnabled}
              disabled={isPending}
            />
          </div>

          <div className="flex items-start justify-between gap-5 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="showFloatingWhatsapp">
                Tampilkan tombol WhatsApp mengambang
              </Label>
              <p className="text-sm leading-6 text-muted-foreground">
                Tombol hanya tampil apabila nomor WhatsApp tersedia pada profil
                sekolah.
              </p>
            </div>
            <input
              type="hidden"
              name="showFloatingWhatsapp"
              value={showFloatingWhatsapp ? "true" : "false"}
            />
            <Switch
              id="showFloatingWhatsapp"
              checked={showFloatingWhatsapp}
              onCheckedChange={setShowFloatingWhatsapp}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="privacyPolicyText">
              Ringkasan kebijakan privasi formulir
            </Label>
            <Textarea
              id="privacyPolicyText"
              name="privacyPolicyText"
              defaultValue={settings.privacyPolicyText}
              maxLength={2_000}
              rows={5}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.privacyPolicyText?.length,
              )}
              aria-describedby={descriptionId(
                "privacyPolicyText",
                state.fieldErrors,
              )}
            />
            <p
              id="privacyPolicyText-help"
              className="text-xs text-muted-foreground"
            >
              Teks ini tampil di bawah formulir kontak publik.
            </p>
            <FieldError field="privacyPolicyText" errors={state.fieldErrors} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesin Pencari</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-start justify-between gap-5 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="allowIndexing">Izinkan indexing</Label>
              <p className="text-sm leading-6 text-muted-foreground">
                Indexing tetap bergantung pada konfigurasi environment
                deployment.
              </p>
            </div>
            <input
              type="hidden"
              name="allowIndexing"
              value={allowIndexing ? "true" : "false"}
            />
            <Switch
              id="allowIndexing"
              checked={allowIndexing}
              onCheckedChange={setAllowIndexing}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </form>
  );
}
