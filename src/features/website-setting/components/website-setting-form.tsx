"use client";

import { useActionState, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateWebsiteSettingAction } from "@/features/website-setting/actions";
import {
  initialWebsiteSettingActionState,
  type WebsiteSettingFieldName,
  type WebsiteSettingValues,
} from "@/features/website-setting/types";
import { useActionToast } from "@/hooks/use-action-toast";

type WebsiteSettingFormProps = {
  settings: WebsiteSettingValues;
};

type FieldErrors = Partial<Record<WebsiteSettingFieldName, string[]>>;

function FieldError({
  field,
  errors,
}: {
  field: WebsiteSettingFieldName;
  errors?: FieldErrors;
}) {
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

function getDescriptionId(
  field: WebsiteSettingFieldName,
  errors?: FieldErrors,
): string {
  return errors?.[field]?.length ? `${field}-error` : `${field}-help`;
}

export function WebsiteSettingForm({ settings }: WebsiteSettingFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateWebsiteSettingAction,
    initialWebsiteSettingActionState,
  );

  const [allowIndexing, setAllowIndexing] = useState(settings.allowIndexing);

  useActionToast(state);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.message ? (
        <Alert
          variant={state.status === "error" ? "destructive" : "default"}
          role="status"
        >
          <AlertTitle>
            {state.status === "success" ? "Berhasil" : "Data belum tersimpan"}
          </AlertTitle>

          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Identitas SEO</CardTitle>

          <CardDescription>
            Metadata default yang digunakan ketika halaman tidak mempunyai
            metadata khusus.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="defaultTitle">Judul default website</Label>

            <Input
              id="defaultTitle"
              name="defaultTitle"
              defaultValue={settings.defaultTitle}
              placeholder="Website Resmi SD Negeri 01"
              maxLength={180}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.defaultTitle?.length)}
              aria-describedby={getDescriptionId(
                "defaultTitle",
                state.fieldErrors,
              )}
            />

            <p
              id="defaultTitle-help"
              className="text-xs leading-5 text-muted-foreground"
            >
              Kosongkan untuk memakai nama sekolah dari Profil Sekolah.
            </p>

            <FieldError field="defaultTitle" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDescription">Deskripsi meta default</Label>

            <Textarea
              id="defaultDescription"
              name="defaultDescription"
              defaultValue={settings.defaultDescription}
              placeholder="Website resmi sekolah yang memuat profil, program, berita, dan informasi pendidikan."
              rows={4}
              maxLength={320}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.defaultDescription?.length,
              )}
              aria-describedby={getDescriptionId(
                "defaultDescription",
                state.fieldErrors,
              )}
            />

            <p
              id="defaultDescription-help"
              className="text-xs leading-5 text-muted-foreground"
            >
              Disarankan sekitar 120–160 karakter agar tampil baik pada hasil
              pencarian.
            </p>

            <FieldError field="defaultDescription" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Kata kunci</Label>

            <Textarea
              id="keywords"
              name="keywords"
              defaultValue={settings.keywords}
              placeholder="sekolah dasar, pendidikan, nama sekolah, nama kota"
              rows={3}
              maxLength={1000}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.keywords?.length)}
              aria-describedby={getDescriptionId("keywords", state.fieldErrors)}
            />

            <p
              id="keywords-help"
              className="text-xs leading-5 text-muted-foreground"
            >
              Pisahkan kata kunci menggunakan koma atau baris baru.
            </p>

            <FieldError field="keywords" errors={state.fieldErrors} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tampilan saat dibagikan</CardTitle>

          <CardDescription>
            Digunakan oleh WhatsApp, Facebook, X, LinkedIn, dan aplikasi lain
            ketika tautan website dibagikan.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="openGraphImageUrl">URL gambar Open Graph</Label>

            <Input
              id="openGraphImageUrl"
              name="openGraphImageUrl"
              type="url"
              defaultValue={settings.openGraphImageUrl}
              placeholder="https://savegaleri.my.id/..."
              maxLength={4000}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.openGraphImageUrl?.length,
              )}
              aria-describedby={getDescriptionId(
                "openGraphImageUrl",
                state.fieldErrors,
              )}
            />

            <p
              id="openGraphImageUrl-help"
              className="text-xs leading-5 text-muted-foreground"
            >
              Ukuran yang disarankan 1200 × 630 px. Apabila kosong, sistem
              memakai gambar hero atau logo sekolah.
            </p>

            <FieldError field="openGraphImageUrl" errors={state.fieldErrors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterHandle">Username X/Twitter</Label>

            <Input
              id="twitterHandle"
              name="twitterHandle"
              defaultValue={settings.twitterHandle}
              placeholder="@namasekolah"
              maxLength={16}
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.twitterHandle?.length)}
              aria-describedby={getDescriptionId(
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesin pencari</CardTitle>

          <CardDescription>
            Atur indexing dan verifikasi kepemilikan website.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-5">
          <div className="flex items-center justify-between gap-5 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="allowIndexing">Izinkan indexing</Label>

              <p className="text-xs leading-5 text-muted-foreground">
                Nonaktifkan selama website belum siap dipublikasikan.
                Environment development tetap tidak akan di-index.
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

          <div className="space-y-2">
            <Label htmlFor="googleSiteVerification">
              Google Site Verification
            </Label>

            <Input
              id="googleSiteVerification"
              name="googleSiteVerification"
              defaultValue={settings.googleSiteVerification}
              placeholder="Kode verifikasi dari Google Search Console"
              maxLength={200}
              disabled={isPending}
              aria-invalid={Boolean(
                state.fieldErrors?.googleSiteVerification?.length,
              )}
              aria-describedby={getDescriptionId(
                "googleSiteVerification",
                state.fieldErrors,
              )}
            />

            <p
              id="googleSiteVerification-help"
              className="text-xs leading-5 text-muted-foreground"
            >
              Masukkan hanya nilai content dari meta tag Google, bukan seluruh
              kode meta.
            </p>

            <FieldError
              field="googleSiteVerification"
              errors={state.fieldErrors}
            />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Menyimpan...
            </>
          ) : (
            "Simpan pengaturan"
          )}
        </Button>
      </div>
    </form>
  );
}
