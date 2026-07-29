import type { Metadata } from "next";
import {
  Award,
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Newspaper,
  Phone,
  Quote,
  School,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicHomepageData } from "@/features/public-site/queries";
import {
  ppdbStatusLabels,
  type PpdbStatusValue,
} from "@/features/ppdb/constants";
import {
  getSafePublicUrl,
  toPhoneHref,
  toWhatsAppHref,
} from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Beranda",
};

const achievementTypeLabels = {
  STUDENT: "Prestasi Siswa",
  TEACHER: "Prestasi Guru",
  SCHOOL: "Prestasi Sekolah",
} as const;

const competitionLevelLabels = {
  SCHOOL: "Sekolah",
  DISTRICT: "Kecamatan",
  CITY: "Kabupaten/Kota",
  PROVINCE: "Provinsi",
  NATIONAL: "Nasional",
  INTERNATIONAL: "Internasional",
} as const;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 leading-7 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function MediaPlaceholder({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center bg-muted">
      <div className="flex size-14 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
    </div>
  );
}

function MediaCover({
  url,
  label,
  fallback,
  className = "aspect-[4/3]",
}: {
  url: string | null | undefined;
  label: string;
  fallback: ReactNode;
  className?: string;
}) {
  const safeUrl = getSafePublicUrl(url);

  if (!safeUrl) {
    return (
      <div className={className}>
        <MediaPlaceholder icon={fallback} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`${className} bg-muted bg-cover bg-center`}
      style={{
        backgroundImage: `url(${JSON.stringify(safeUrl)})`,
      }}
    />
  );
}

function formatDate(value: Date | null): string {
  if (!value) {
    return "Tanggal belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function getAnnouncementVariant(
  priority: "NORMAL" | "IMPORTANT" | "URGENT",
): "default" | "secondary" | "destructive" {
  if (priority === "URGENT") {
    return "destructive";
  }

  if (priority === "IMPORTANT") {
    return "default";
  }

  return "secondary";
}

function getPpdbVariant(
  status: PpdbStatusValue,
): "default" | "secondary" | "destructive" | "outline" {
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

export default async function HomePage() {
  const data = await getPublicHomepageData();

  const profile = data.profile;
  const schoolName = profile?.schoolName ?? "Sekolah Dasar";

  const heroImage = getSafePublicUrl(profile?.heroImageUrl);

  const principalName = data.principal?.name ?? profile?.principalName;

  const principalTitle =
    data.principal?.position ?? profile?.principalTitle ?? "Kepala Sekolah";

  const principalPhoto = data.principal?.photoUrl ?? profile?.principalPhotoUrl;

  const principalGreeting =
    profile?.principalGreeting ?? data.principal?.shortBiography;

  const address = profile ? buildAddress(profile) : "";

  return (
    <main>
      {data.announcements.length > 0 ? (
        <section className="border-b bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {data.announcements.map((announcement) => {
              const attachment = getSafePublicUrl(announcement.attachmentUrl);

              return (
                <div
                  key={announcement.id}
                  className="flex flex-col gap-3 rounded-lg border bg-background px-4 py-3 sm:flex-row sm:items-center"
                >
                  <Badge
                    variant={getAnnouncementVariant(announcement.priority)}
                    className="w-fit shrink-0"
                  >
                    {announcement.priority === "URGENT"
                      ? "Mendesak"
                      : announcement.priority === "IMPORTANT"
                        ? "Penting"
                        : "Pengumuman"}
                  </Badge>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{announcement.title}</p>

                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {announcement.content}
                    </p>
                  </div>

                  {attachment ? (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="size-4" />
                        Lampiran
                      </a>
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section
        className={
          heroImage
            ? "relative overflow-hidden bg-cover bg-center text-white"
            : "relative overflow-hidden bg-primary text-primary-foreground"
        }
        style={
          heroImage
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(9, 18, 34, 0.92), rgba(9, 18, 34, 0.58), rgba(9, 18, 34, 0.28)), url(${JSON.stringify(
                  heroImage,
                )})`,
              }
            : undefined
        }
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 px-3 py-1">
              <School className="size-3.5" />
              Website Resmi Sekolah
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {schoolName}
            </h1>

            <p className="mt-5 text-xl font-medium sm:text-2xl">
              {profile?.tagline ?? "Tumbuh, belajar, dan berprestasi bersama."}
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              {profile?.shortDescription ??
                "Lingkungan pendidikan yang aman, menyenangkan, dan berorientasi pada perkembangan karakter serta potensi setiap anak."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {data.ppdb ? (
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/ppdb">Informasi PPDB</Link>
                </Button>
              ) : null}

              <Button
                size="lg"
                variant={heroImage ? "outline" : "secondary"}
                className={
                  heroImage
                    ? "border-white/50 bg-white/10 text-white hover:bg-white hover:text-slate-950"
                    : undefined
                }
                asChild
              >
                <Link href="/profil">Mengenal Sekolah</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              label: "Guru dan Tenaga Pendidikan",
              value: data.statistics.teachers,
              icon: <Users className="size-5" />,
            },
            {
              label: "Program Pendidikan",
              value: data.statistics.programs,
              icon: <BookOpenCheck className="size-5" />,
            },
            {
              label: "Fasilitas",
              value: data.statistics.facilities,
              icon: <Building2 className="size-5" />,
            },
            {
              label: "Prestasi",
              value: data.statistics.achievements,
              icon: <Trophy className="size-5" />,
            },
          ].map((statistic) => (
            <Card key={statistic.label}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {statistic.icon}
                </div>

                <div>
                  <p className="text-2xl font-bold">{statistic.value}</p>

                  <p className="text-sm text-muted-foreground">
                    {statistic.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="profil" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Profil Sekolah
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Pendidikan yang membangun karakter dan potensi anak
            </h2>

            <p className="mt-5 whitespace-pre-line leading-8 text-muted-foreground">
              {profile?.history ??
                profile?.shortDescription ??
                `${schoolName} berkomitmen menyediakan lingkungan belajar yang aman, aktif, dan mendukung perkembangan setiap siswa.`}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {profile?.vision ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visi</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {profile.vision}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {profile?.schoolValues.slice(0, 4).length ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Nilai Sekolah</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-2">
                    {profile.schoolValues.slice(0, 4).map((value) => (
                      <div
                        key={value}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        {value}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="grid sm:grid-cols-[220px_1fr]">
              <MediaCover
                url={principalPhoto}
                label={
                  principalName
                    ? `Foto ${principalName}`
                    : "Foto kepala sekolah"
                }
                fallback={<GraduationCap className="size-7" />}
                className="aspect-square sm:aspect-auto sm:min-h-80"
              />

              <CardContent className="flex flex-col justify-center pt-6">
                <Quote className="size-8 text-primary/40" />

                <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
                  {principalGreeting ??
                    "Selamat datang di website resmi sekolah. Semoga media ini membantu masyarakat memperoleh informasi yang jelas dan terpercaya mengenai layanan serta kegiatan sekolah."}
                </p>

                <div className="mt-6">
                  <p className="font-semibold">
                    {principalName ?? "Kepala Sekolah"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {principalTitle}
                  </p>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {data.programs.length > 0 ? (
        <section
          id="program"
          className="scroll-mt-24 bg-muted/30 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Program Unggulan"
              title="Pembelajaran yang relevan dan bermakna"
              description="Program pendidikan disusun untuk mendukung kemampuan akademik, karakter, kreativitas, dan keterampilan sosial siswa."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.programs.map((program) => (
                <Card key={program.id} className="overflow-hidden">
                  <MediaCover
                    url={program.imageUrl}
                    label={`Program ${program.name}`}
                    fallback={<BookOpenCheck className="size-7" />}
                  />

                  <CardHeader>
                    <CardTitle>{program.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                      {program.shortDescription ??
                        program.description ??
                        "Informasi program akan diperbarui."}
                    </p>

                    {program.benefits.length > 0 ? (
                      <div className="mt-5 grid gap-2">
                        {program.benefits.slice(0, 3).map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.facilities.length > 0 ? (
        <section id="fasilitas" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Fasilitas"
              title="Lingkungan belajar yang nyaman"
              description="Fasilitas sekolah mendukung kegiatan belajar, pengembangan minat, kesehatan, keamanan, dan kenyamanan siswa."
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.facilities.map((facility) => (
                <Card key={facility.id} className="overflow-hidden">
                  <MediaCover
                    url={facility.imageUrl}
                    label={`Fasilitas ${facility.name}`}
                    fallback={<Building2 className="size-7" />}
                  />

                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/fasilitas/${facility.slug}`}
                        className="hover:text-primary"
                      >
                        {facility.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {facility.description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {facility.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {facility.capacity ? (
                        <Badge variant="outline">{facility.capacity}</Badge>
                      ) : null}

                      {facility.condition ? (
                        <Badge variant="secondary">{facility.condition}</Badge>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.achievements.length > 0 ? (
        <section
          id="prestasi"
          className="scroll-mt-24 bg-muted/30 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Prestasi"
              title="Pencapaian yang membanggakan"
              description="Prestasi merupakan hasil proses belajar, kerja sama, kedisiplinan, dan dukungan seluruh warga sekolah."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {data.achievements.map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden">
                  <MediaCover
                    url={achievement.imageUrl}
                    label={achievement.title}
                    fallback={<Award className="size-7" />}
                  />

                  <CardHeader>
                    <div className="flex flex-wrap gap-2">
                      <Badge>
                        {achievementTypeLabels[achievement.achievementType]}
                      </Badge>

                      {achievement.competitionLevel ? (
                        <Badge variant="outline">
                          {competitionLevelLabels[achievement.competitionLevel]}
                        </Badge>
                      ) : null}
                    </div>

                    <CardTitle className="pt-2 text-lg">
                      <Link
                        href={`/prestasi/${achievement.slug}`}
                        className="hover:text-primary"
                      >
                        {achievement.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {achievement.winnerName ? (
                      <p className="font-medium">{achievement.winnerName}</p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {achievement.rank ? (
                        <Badge variant="secondary">{achievement.rank}</Badge>
                      ) : null}

                      {achievement.category ? (
                        <Badge variant="outline">{achievement.category}</Badge>
                      ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formatDate(achievement.achievementDate)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.extracurriculars.length > 0 ? (
        <section id="ekstrakurikuler" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Ekstrakurikuler"
              title="Ruang untuk bertumbuh dan berekspresi"
              description="Kegiatan ekstrakurikuler membantu siswa mengembangkan minat, bakat, kepemimpinan, kesehatan, dan kemampuan bekerja sama."
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.extracurriculars.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  <MediaCover
                    url={activity.imageUrl}
                    label={`Kegiatan ${activity.name}`}
                    fallback={<Sparkles className="size-7" />}
                  />

                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/ekstrakurikuler/${activity.slug}`}
                        className="hover:text-primary"
                      >
                        {activity.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {activity.description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {activity.description}
                      </p>
                    ) : null}

                    {activity.schedule ? (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
                        {activity.schedule}
                      </div>
                    ) : null}

                    {activity.coach ? (
                      <div className="flex items-start gap-2 text-sm">
                        <Users className="mt-0.5 size-4 shrink-0 text-primary" />
                        Pembina: {activity.coach}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.posts.length > 0 ? (
        <section
          id="berita"
          className="scroll-mt-24 bg-muted/30 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Berita Sekolah"
              title="Informasi dan kegiatan terbaru"
              description="Ikuti kegiatan pembelajaran, pencapaian, agenda, serta kabar terbaru dari lingkungan sekolah."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {data.posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <MediaCover
                    url={post.featuredImageUrl}
                    label={post.title}
                    fallback={<Newspaper className="size-7" />}
                  />

                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {post.category ? (
                        <Badge variant="outline">{post.category.name}</Badge>
                      ) : null}

                      <span>
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </span>
                    </div>

                    <CardTitle className="line-clamp-2 text-xl">
                      {post.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {post.excerpt ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}

                    {post.author ? (
                      <p className="mt-4 text-xs text-muted-foreground">
                        Oleh {post.author.name}
                      </p>
                    ) : null}

                    <Button variant="link" className="mt-4 h-auto p-0" asChild>
                      <Link href={`/berita/${post.slug}`}>
                        Baca selengkapnya
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.galleryAlbums.length > 0 ? (
        <section id="galeri" className="scroll-mt-24 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Galeri"
              title="Dokumentasi kegiatan sekolah"
              description="Beragam aktivitas pembelajaran, kreativitas, kebersamaan, dan pencapaian warga sekolah."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {data.galleryAlbums.map((album) => {
                const firstMedia = album.media[0];

                const cover =
                  album.coverImageUrl ??
                  firstMedia?.thumbnailUrl ??
                  (firstMedia?.mediaType === "IMAGE"
                    ? firstMedia.fileUrl
                    : null);

                return (
                  <Card key={album.id} className="overflow-hidden">
                    <MediaCover
                      url={cover}
                      label={`Album ${album.title}`}
                      fallback={<CalendarDays className="size-7" />}
                    />

                    <CardHeader>
                      <CardTitle className="text-xl">{album.title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>{formatDate(album.eventDate)}</span>

                        <Badge variant="secondary">
                          {album._count.media} media
                        </Badge>
                      </div>

                      {album.description ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {album.description}
                        </p>
                      ) : null}

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/galeri/${album.slug}`}>Buka album</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {data.testimonials.length > 0 ? (
        <section id="testimoni" className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Testimoni"
              title="Kepercayaan dari komunitas sekolah"
              description="Pandangan orang tua, alumni, siswa, dan masyarakat mengenai pengalaman bersama sekolah."
            />

            <div className="grid gap-6 md:grid-cols-3">
              {data.testimonials.map((testimonial) => (
                <Card key={testimonial.id}>
                  <CardContent className="pt-6">
                    <Quote className="size-8 text-primary/30" />

                    <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">
                      “{testimonial.content}”
                    </p>

                    <div className="mt-6 flex items-center gap-3">
                      <MediaCover
                        url={testimonial.photoUrl}
                        label={`Foto ${testimonial.name}`}
                        fallback={<Users className="size-5" />}
                        className="size-12 shrink-0 overflow-hidden rounded-full"
                      />

                      <div>
                        <p className="font-semibold">{testimonial.name}</p>

                        <p className="text-sm text-muted-foreground">
                          {testimonial.role ?? "Komunitas Sekolah"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/testimoni">Lihat semua testimoni</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {data.ppdb ? (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground">
              <CardContent className="grid gap-8 pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <Badge variant={getPpdbVariant(data.ppdb.status)}>
                    {ppdbStatusLabels[data.ppdb.status]}
                  </Badge>

                  <h2 className="mt-5 text-3xl font-bold tracking-tight">
                    {data.ppdb.title}
                  </h2>

                  <p className="mt-2 font-medium">
                    Tahun Ajaran {data.ppdb.academicYear}
                  </p>

                  {data.ppdb.shortDescription ? (
                    <p className="mt-4 max-w-3xl leading-7 text-primary-foreground/80">
                      {data.ppdb.shortDescription}
                    </p>
                  ) : null}

                  {data.ppdb.quota !== null ? (
                    <p className="mt-4 text-sm text-primary-foreground/80">
                      Kuota tersedia: {data.ppdb.quota} siswa
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/ppdb">Lihat Informasi PPDB</Link>
                  </Button>

                  {getSafePublicUrl(data.ppdb.brochureUrl) ? (
                    <Button variant="secondary" size="lg" asChild>
                      <a
                        href={getSafePublicUrl(data.ppdb.brochureUrl) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="size-4" />
                        Brosur
                      </a>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {profile &&
      (address ||
        profile.phone ||
        profile.whatsapp ||
        profile.email ||
        profile.operationalHours) ? (
        <section className="border-t bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Hubungi Kami
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Dapatkan informasi resmi langsung dari sekolah
              </h2>

              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                Gunakan kanal resmi berikut untuk memperoleh informasi mengenai
                sekolah, program, kegiatan, dan PPDB.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {profile.whatsapp ? (
                  <Button asChild>
                    <a
                      href={toWhatsAppHref(
                        profile.whatsapp,
                        `Halo ${schoolName}, saya ingin memperoleh informasi mengenai sekolah.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" />
                      WhatsApp
                    </a>
                  </Button>
                ) : null}

                {profile.phone ? (
                  <Button variant="outline" asChild>
                    <a href={toPhoneHref(profile.phone)}>
                      <Phone className="size-4" />
                      Telepon
                    </a>
                  </Button>
                ) : null}

                {profile.email ? (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${profile.email}`}>
                      <Mail className="size-4" />
                      Email
                    </a>
                  </Button>
                ) : null}

                {getSafePublicUrl(profile.mapEmbedUrl) ? (
                  <Button variant="outline" asChild>
                    <a
                      href={getSafePublicUrl(profile.mapEmbedUrl) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="size-4" />
                      Lihat Peta
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>

            <Card>
              <CardContent className="grid gap-5 pt-6">
                {address ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">Alamat</p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {address}
                      </p>
                    </div>
                  </div>
                ) : null}

                {profile.operationalHours ? (
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">Jam Operasional</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {profile.operationalHours}
                      </p>
                    </div>
                  </div>
                ) : null}

                {profile.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">Telepon</p>

                      <a
                        href={toPhoneHref(profile.phone)}
                        className="mt-1 inline-block text-sm text-primary hover:underline"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {profile.email ? (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="font-medium">Email</p>

                      <a
                        href={`mailto:${profile.email}`}
                        className="mt-1 inline-block break-all text-sm text-primary hover:underline"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}
    </main>
  );
}
