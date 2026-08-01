import type { Metadata } from "next";
import {
  Award,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Quote,
  School,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

import { ProfilePageMotionController } from "@/components/motion/profile-page-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicSchoolProfile } from "@/features/public-site/queries";
import {
  getSafePublicUrl,
  toPhoneHref,
  toWhatsAppHref,
} from "@/lib/public-links";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getPublicSchoolProfile();

  const schoolName = profile?.schoolName ?? "Sekolah Dasar";

  return {
    alternates: {
      canonical: "/profil",
    },
    title: "Profil Sekolah",
    description:
      profile?.shortDescription ??
      `Profil, sejarah, visi, misi, dan informasi resmi ${schoolName}.`,
  };
}

function buildAddress(profile: {
  address: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
}): string {
  return [
    profile.address,
    profile.village,
    profile.district,
    profile.city,
    profile.province,
    profile.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function EmptyProfilePage() {
  return (
    <main className="flex min-h-[65svh] items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <School className="size-8 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Profil sekolah belum tersedia
        </h1>

        <p className="mt-3 text-muted-foreground">
          Informasi profil sekolah belum diisi atau masih dalam proses
          pembaruan.
        </p>
      </div>
    </main>
  );
}

export default async function PublicProfilePage() {
  const profile = await getPublicSchoolProfile();

  if (!profile) {
    return <EmptyProfilePage />;
  }

  const schoolName = profile.schoolName;
  const address = buildAddress(profile);

  const heroImage = getSafePublicUrl(profile.heroImageUrl);

  const principalPhoto = getSafePublicUrl(profile.principalPhotoUrl);

  const whatsappHref = profile.whatsapp
    ? toWhatsAppHref(
        profile.whatsapp,
        `Halo ${schoolName}, saya ingin memperoleh informasi mengenai sekolah.`,
      )
    : null;

  return (
    <main>
      <ProfilePageMotionController />

      <section
        className={
          heroImage
            ? "relative overflow-hidden bg-cover bg-center text-white"
            : "relative overflow-hidden border-b bg-muted/30"
        }
        style={
          heroImage
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(9, 18, 34, 0.92), rgba(9, 18, 34, 0.62), rgba(9, 18, 34, 0.34)), url(${JSON.stringify(
                  heroImage,
                )})`,
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />

        <div className="relative mx-auto flex min-h-[420px] max-w-7xl items-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-4xl">
            <Badge variant={heroImage ? "secondary" : "outline"}>
              <School className="size-3.5" />
              Profil Resmi Sekolah
            </Badge>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {schoolName}
            </h1>

            {profile.tagline ? (
              <p
                className={
                  heroImage
                    ? "mt-5 max-w-3xl text-xl leading-8 text-white/85"
                    : "mt-5 max-w-3xl text-xl leading-8 text-muted-foreground"
                }
              >
                {profile.tagline}
              </p>
            ) : null}

            {profile.shortDescription ? (
              <p
                className={
                  heroImage
                    ? "mt-4 max-w-3xl leading-8 text-white/75"
                    : "mt-4 max-w-3xl leading-8 text-muted-foreground"
                }
              >
                {profile.shortDescription}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <School className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">NPSN</p>

                <p className="font-semibold">
                  {profile.npsn ?? "Belum tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Akreditasi</p>

                <p className="font-semibold">
                  {profile.accreditation ?? "Belum tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tahun Berdiri</p>

                <p className="font-semibold">
                  {profile.foundedYear ?? "Belum tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Kepala Sekolah</p>

                <p className="font-semibold">
                  {profile.principalName ?? "Belum tersedia"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Tentang Sekolah
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Sejarah dan perjalanan sekolah
            </h2>

            {profile.history ? (
              <p className="mt-6 whitespace-pre-line leading-8 text-muted-foreground">
                {profile.history}
              </p>
            ) : (
              <p className="mt-6 leading-8 text-muted-foreground">
                Sejarah sekolah belum ditambahkan.
              </p>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                Identitas Sekolah
              </CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Nama Sekolah
                  </dt>

                  <dd className="mt-1 font-medium">{profile.schoolName}</dd>
                </div>

                {profile.shortName ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Nama Singkat
                    </dt>

                    <dd className="mt-1 font-medium">{profile.shortName}</dd>
                  </div>
                ) : null}

                {profile.npsn ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">NPSN</dt>

                    <dd className="mt-1 font-medium">{profile.npsn}</dd>
                  </div>
                ) : null}

                {profile.accreditation ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Akreditasi
                    </dt>

                    <dd className="mt-1 font-medium">
                      {profile.accreditation}
                    </dd>
                  </div>
                ) : null}

                {profile.foundedYear ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">
                      Tahun Berdiri
                    </dt>

                    <dd className="mt-1 font-medium">{profile.foundedYear}</dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      {(profile.vision ||
        profile.mission.length > 0 ||
        profile.goals.length > 0) && (
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Arah Pendidikan
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Visi, misi, dan tujuan sekolah
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    Visi
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="whitespace-pre-line leading-7 text-muted-foreground">
                    {profile.vision ?? "Visi sekolah belum ditambahkan."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpenCheck className="size-5 text-primary" />
                    Misi
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {profile.mission.length > 0 ? (
                    <ol className="grid gap-4">
                      {profile.mission.map((item, index) => (
                        <li
                          key={`${index}-${item}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {index + 1}
                          </div>

                          <p className="leading-7 text-muted-foreground">
                            {item}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground">
                      Misi sekolah belum ditambahkan.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="size-5 text-primary" />
                    Tujuan
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {profile.goals.length > 0 ? (
                    <ul className="grid gap-4">
                      {profile.goals.map((item, index) => (
                        <li
                          key={`${index}-${item}`}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />

                          <p className="leading-7 text-muted-foreground">
                            {item}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Tujuan sekolah belum ditambahkan.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {profile.schoolValues.length > 0 ? (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Budaya Sekolah
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Nilai-nilai yang ditanamkan
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                Nilai sekolah menjadi dasar dalam proses pembelajaran,
                pembentukan karakter, dan interaksi seluruh warga sekolah.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.schoolValues.map((value, index) => (
                <Card key={`${index}-${value}`}>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>

                    <p className="pt-2 font-medium">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(profile.principalName ||
        profile.principalGreeting ||
        principalPhoto) && (
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-[320px_1fr]">
                {principalPhoto ? (
                  <div
                    role="img"
                    aria-label={`Foto ${
                      profile.principalName ?? "kepala sekolah"
                    }`}
                    className="min-h-80 bg-muted bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${JSON.stringify(principalPhoto)})`,
                    }}
                  />
                ) : (
                  <div className="flex min-h-80 items-center justify-center bg-muted">
                    <GraduationCap className="size-16 text-muted-foreground" />
                  </div>
                )}

                <CardContent className="flex flex-col justify-center p-8 sm:p-10">
                  <Quote className="size-10 text-primary/30" />

                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Sambutan Kepala Sekolah
                  </p>

                  <p className="mt-4 whitespace-pre-line text-lg leading-8 text-muted-foreground">
                    {profile.principalGreeting ??
                      "Selamat datang di website resmi sekolah. Media ini diharapkan menjadi sumber informasi yang jelas bagi siswa, orang tua, alumni, dan masyarakat."}
                  </p>

                  <div className="mt-8">
                    <p className="text-lg font-semibold">
                      {profile.principalName ?? "Kepala Sekolah"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {profile.principalTitle ?? "Kepala Sekolah"}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {(address ||
        profile.phone ||
        profile.whatsapp ||
        profile.email ||
        profile.operationalHours) && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Informasi Kontak
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Lokasi dan layanan sekolah
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {address ? (
                <Card>
                  <CardContent className="pt-6">
                    <MapPin className="size-6 text-primary" />

                    <p className="mt-4 font-semibold">Alamat</p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {address}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {profile.phone ? (
                <Card>
                  <CardContent className="pt-6">
                    <Phone className="size-6 text-primary" />

                    <p className="mt-4 font-semibold">Telepon</p>

                    <a
                      href={toPhoneHref(profile.phone)}
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      {profile.phone}
                    </a>
                  </CardContent>
                </Card>
              ) : null}

              {profile.email ? (
                <Card>
                  <CardContent className="pt-6">
                    <Mail className="size-6 text-primary" />

                    <p className="mt-4 font-semibold">Email</p>

                    <a
                      href={`mailto:${profile.email}`}
                      className="mt-2 inline-block break-all text-sm text-primary hover:underline"
                    >
                      {profile.email}
                    </a>
                  </CardContent>
                </Card>
              ) : null}

              {profile.operationalHours ? (
                <Card>
                  <CardContent className="pt-6">
                    <Clock3 className="size-6 text-primary" />

                    <p className="mt-4 font-semibold">Jam Operasional</p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {profile.operationalHours}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {whatsappHref ? (
              <div className="mt-8 text-center">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Users className="mr-2 size-4" />
                  Hubungi Sekolah melalui WhatsApp
                </a>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
