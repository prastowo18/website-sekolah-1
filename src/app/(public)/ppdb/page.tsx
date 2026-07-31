import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  ListChecks,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  School,
  Sparkles,
  Users,
} from "lucide-react";

import { PublicPageMotionController } from "@/components/motion/public-page-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizePpdbGoogleDriveUrl } from "@/features/ppdb/google-drive-url";
import {
  ppdbFeeTypeLabels,
  ppdbStatusLabels,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";
import { getActivePublicPpdb } from "@/features/ppdb/public-queries";

export async function generateMetadata(): Promise<Metadata> {
  const ppdb = await getActivePublicPpdb();

  if (!ppdb) {
    return {
      title: "Informasi PPDB",
      description: "Informasi penerimaan peserta didik baru.",
    };
  }

  return {
    title: `${ppdb.title} ${ppdb.academicYear}`,
    description:
      ppdb.shortDescription ??
      `Informasi PPDB tahun ajaran ${ppdb.academicYear}.`,
  };
}

function getStatusVariant(
  status: PpdbStatusValue,
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "OPEN") {
    return "default";
  }

  if (status === "ANNOUNCEMENT") {
    return "destructive";
  }

  if (status === "CLOSED" || status === "COMPLETED") {
    return "secondary";
  }

  return "outline";
}

function formatDateTime(value: Date | null): string {
  if (!value) {
    return "Belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function formatFee(
  value: {
    toString(): string;
  } | null,
): string {
  if (!value) {
    return "Hubungi sekolah";
  }

  const amount = Number(value.toString());

  if (!Number.isFinite(amount)) {
    return value.toString();
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function isSafePublicUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function phoneHref(value: string): string {
  return `tel:${value.replace(/[^0-9+]/g, "")}`;
}

export default async function PublicPpdbPage() {
  const ppdb = await getActivePublicPpdb();

  if (!ppdb) {
    return (
      <main className="min-h-[70svh]">
        <PublicPageMotionController pageId="ppdb" />
        <section className="border-b bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="size-8 text-primary" />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Informasi PPDB
            </h1>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Informasi penerimaan peserta didik baru belum tersedia atau belum
              diaktifkan.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Silakan kembali mengunjungi halaman ini pada waktu berikutnya.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const brochureUrl = normalizePpdbGoogleDriveUrl(ppdb.brochureUrl ?? "");

  const brochureAvailable =
    brochureUrl !== null && isSafePublicUrl(brochureUrl);

  const externalRegistrationAvailable = false;

  const hasContact =
    Boolean(ppdb.contactPerson) ||
    Boolean(ppdb.contactPhone) ||
    Boolean(ppdb.contactEmail) ||
    Boolean(ppdb.serviceHours) ||
    Boolean(ppdb.registrationLocation);

  return (
    <main>
      <PublicPageMotionController pageId="ppdb" />

      <section className="relative overflow-hidden border-b bg-muted/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.06),transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={getStatusVariant(ppdb.status)}
                className="px-3 py-1 text-sm"
              >
                <Megaphone className="size-3.5" />
                {ppdbStatusLabels[ppdb.status]}
              </Badge>

              <Badge variant="outline" className="px-3 py-1 text-sm">
                Tahun Ajaran {ppdb.academicYear}
              </Badge>
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {ppdb.title}
            </h1>

            {ppdb.shortDescription ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {ppdb.shortDescription}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {brochureAvailable ? (
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={brochureUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="size-4" />
                    Lihat Brosur
                  </a>
                </Button>
              ) : null}

              {externalRegistrationAvailable ? (
                <Button size="lg" asChild>
                  <a
                    href={ppdb.externalRegistrationUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pendaftaran Eksternal
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>

            {externalRegistrationAvailable ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Tombol pendaftaran membuka layanan eksternal. Website sekolah
                tidak menyimpan data pendaftaran calon siswa.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <School className="size-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tahun Ajaran</p>
                <p className="font-semibold">{ppdb.academicYear}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Kuota</p>
                <p className="font-semibold">
                  {ppdb.quota !== null
                    ? `${ppdb.quota} siswa`
                    : "Belum ditentukan"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="size-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Agenda</p>
                <p className="font-semibold">
                  {ppdb.timelineItems.length} jadwal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <FileCheck2 className="size-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Persyaratan</p>
                <p className="font-semibold">{ppdb.requirements.length} item</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {ppdb.description ? (
          <section>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Informasi Umum
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Tentang PPDB
              </h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-muted-foreground">
                {ppdb.description}
              </p>
            </div>
          </section>
        ) : null}

        {ppdb.timelineItems.length > 0 ? (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Jadwal
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Timeline PPDB
              </h2>
            </div>

            <div className="grid gap-4">
              {ppdb.timelineItems.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{item.title}</h3>

                      {item.description ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}

                      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                          <span>Mulai: {formatDateTime(item.startDate)}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                          <span>Selesai: {formatDateTime(item.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {ppdb.requirements.length > 0 ? (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Dokumen dan Ketentuan
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Persyaratan
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ppdb.requirements.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex gap-3 pt-6">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-4 text-primary" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{item.title}</h3>

                        <Badge
                          variant={item.isRequired ? "default" : "outline"}
                        >
                          {item.isRequired ? "Wajib" : "Opsional"}
                        </Badge>
                      </div>

                      {item.description ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {ppdb.flowSteps.length > 0 ? (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Tahapan
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Alur PPDB
              </h2>
            </div>

            <div className="grid gap-4">
              {ppdb.flowSteps.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {index < ppdb.flowSteps.length - 1 ? (
                    <div className="absolute -bottom-4 left-5 top-10 w-px bg-border" />
                  ) : null}

                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background font-semibold text-primary">
                    {item.sortOrder}
                  </div>

                  <Card className="flex-1">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold">{item.title}</h3>

                      {item.description ? (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {ppdb.showFee && ppdb.fees.length > 0 ? (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Transparansi Informasi
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Rincian Biaya
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Nominal berikut bersifat informasi. Konfirmasi kembali kepada
                pihak sekolah untuk ketentuan terbaru.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ppdb.fees.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="outline">
                          {ppdbFeeTypeLabels[item.feeType]}
                        </Badge>

                        <CardTitle className="mt-3 text-lg">
                          {item.name}
                        </CardTitle>
                      </div>

                      <CircleDollarSign className="size-6 text-primary" />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatFee(item.amount)}
                    </p>

                    <Badge
                      className="mt-3"
                      variant={item.isOptional ? "outline" : "secondary"}
                    >
                      {item.isOptional ? "Opsional" : "Wajib"}
                    </Badge>

                    {item.description ? (
                      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {ppdb.scholarshipInformation ? (
          <section>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="size-5 text-primary" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    Beasiswa dan Keringanan
                  </h2>

                  <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">
                    {ppdb.scholarshipInformation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {hasContact ? (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Informasi Lebih Lanjut
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Lokasi dan Kontak PPDB
              </h2>
            </div>

            <Card>
              <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
                <div className="space-y-5">
                  {ppdb.registrationLocation ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="font-medium">Lokasi Pelayanan</p>

                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {ppdb.registrationLocation}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {ppdb.serviceHours ? (
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="font-medium">Jam Pelayanan</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {ppdb.serviceHours}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-5">
                  {ppdb.contactPerson ? (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="font-medium">Kontak Person</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {ppdb.contactPerson}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {ppdb.contactPhone ? (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="font-medium">Nomor Telepon</p>

                        <a
                          href={phoneHref(ppdb.contactPhone)}
                          className="mt-1 inline-block text-sm text-primary underline-offset-4 hover:underline"
                        >
                          {ppdb.contactPhone}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {ppdb.contactEmail ? (
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="font-medium">Email</p>

                        <a
                          href={`mailto:${ppdb.contactEmail}`}
                          className="mt-1 inline-block break-all text-sm text-primary underline-offset-4 hover:underline"
                        >
                          {ppdb.contactEmail}
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>
        ) : null}

        {(brochureAvailable || externalRegistrationAvailable) && (
          <section>
            <Card className="overflow-hidden bg-primary text-primary-foreground">
              <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ListChecks className="size-5" />

                    <h2 className="text-xl font-semibold">
                      Informasi PPDB {ppdb.academicYear}
                    </h2>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
                    Pelajari jadwal, persyaratan, dan informasi lainnya sebelum
                    mengikuti proses penerimaan.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                  {brochureAvailable ? (
                    <Button variant="secondary" asChild>
                      <a
                        href={brochureUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="size-4" />
                        Unduh Brosur
                      </a>
                    </Button>
                  ) : null}

                  {externalRegistrationAvailable ? (
                    <Button variant="secondary" asChild>
                      <a
                        href={ppdb.externalRegistrationUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buka Pendaftaran
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
}
