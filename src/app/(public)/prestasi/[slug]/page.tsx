import type { Metadata } from "next";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ImageOff,
  Medal,
  Trophy,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogPagesMotionController } from "@/components/motion/catalog-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicAchievementBySlug,
  getRelatedPublicAchievements,
} from "@/features/achievement/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";
import { buildPublicShareMetadata } from "@/lib/public-share-metadata";

type PageParams = {
  slug: string;
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

function formatDate(value: Date | null): string {
  if (!value) {
    return "Belum ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function createDescription(description: string | null, title: string): string {
  return (description ?? `Informasi mengenai ${title}.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/prestasi/${encodeURIComponent(slug)}`;

  const achievement = await getPublicAchievementBySlug(slug);

  if (!achievement) {
    return {
      title: "Prestasi Tidak Ditemukan",
    };
  }

  const imageUrl = getSafePublicUrl(achievement.imageUrl);

  const shareMetadataBase: Metadata = {
    alternates: {
      canonical: canonicalPath,
    },
    title: achievement.title,
    description: createDescription(achievement.description, achievement.title),
    openGraph: imageUrl
      ? {
          url: canonicalPath,
          title: achievement.title,
          description: createDescription(
            achievement.description,
            achievement.title,
          ),
          images: [imageUrl],
        }
      : undefined,
  };

  return buildPublicShareMetadata({
    baseMetadata: shareMetadataBase,
    pathname: `/prestasi/${encodeURIComponent(slug)}`,
    imageUrl: imageUrl,
    imageAlt: achievement.title,
    type: "article",
  });
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const achievement = await getPublicAchievementBySlug(slug);

  if (!achievement) {
    notFound();
  }

  const relatedAchievements = await getRelatedPublicAchievements({
    achievementId: achievement.id,
    achievementType: achievement.achievementType,
  });

  const imageUrl = getSafePublicUrl(achievement.imageUrl);

  return (
    <main>
      <CatalogPagesMotionController pageId="achievement-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/prestasi">
              <ArrowLeft className="size-4" />
              Kembali ke prestasi
            </Link>
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_500px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>
                  <Award className="size-3.5" />
                  {achievementTypeLabels[achievement.achievementType]}
                </Badge>

                {achievement.competitionLevel ? (
                  <Badge variant="outline">
                    {competitionLevelLabels[achievement.competitionLevel]}
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {achievement.title}
              </h1>

              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                {achievement.winnerName ? (
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />

                    <span>{achievement.winnerName}</span>
                  </div>
                ) : null}

                {achievement.rank ? (
                  <div className="flex items-start gap-2">
                    <Medal className="mt-0.5 size-4 shrink-0 text-primary" />

                    <span>{achievement.rank}</span>
                  </div>
                ) : null}

                {achievement.category ? (
                  <div className="flex items-start gap-2">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-primary" />

                    <span>{achievement.category}</span>
                  </div>
                ) : null}

                <div className="flex items-start gap-2 text-muted-foreground">
                  <CalendarDays className="mt-0.5 size-4 shrink-0" />

                  <span>{formatDate(achievement.achievementDate)}</span>
                </div>
              </div>
            </div>

            {imageUrl ? (
              <div
                role="img"
                aria-label={achievement.title}
                className="aspect-[16/10] rounded-2xl border bg-muted bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${JSON.stringify(imageUrl)})`,
                }}
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border bg-muted">
                <ImageOff className="size-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-16">
        <article>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Uraian Prestasi
              </p>

              <h2 className="text-2xl font-bold tracking-tight">
                Tentang pencapaian
              </h2>
            </div>
          </div>

          {achievement.description ? (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/85">
              {achievement.description}
            </p>
          ) : (
            <p className="mt-7 leading-8 text-muted-foreground">
              Deskripsi lengkap prestasi belum ditambahkan oleh sekolah.
            </p>
          )}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ringkasan Prestasi</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Jenis prestasi
                  </dt>

                  <dd className="mt-1 font-medium">
                    {achievementTypeLabels[achievement.achievementType]}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Penerima</dt>

                  <dd className="mt-1 font-medium">
                    {achievement.winnerName ?? "Tidak disebutkan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Peringkat</dt>

                  <dd className="mt-1 font-medium">
                    {achievement.rank ?? "Tidak disebutkan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Kategori</dt>

                  <dd className="mt-1 font-medium">
                    {achievement.category ?? "Tidak disebutkan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">
                    Tingkat kompetisi
                  </dt>

                  <dd className="mt-1 font-medium">
                    {achievement.competitionLevel
                      ? competitionLevelLabels[achievement.competitionLevel]
                      : "Tidak disebutkan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">
                    Tanggal prestasi
                  </dt>

                  <dd className="mt-1 font-medium">
                    {formatDate(achievement.achievementDate)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </section>

      {relatedAchievements.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <Trophy className="size-3.5" />
                Prestasi Lainnya
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Pencapaian terkait
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedAchievements.map((related) => {
                const relatedImage = getSafePublicUrl(related.imageUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/prestasi/${related.slug}`}>
                      {relatedImage ? (
                        <div
                          role="img"
                          aria-label={related.title}
                          className="aspect-[16/10] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              relatedImage,
                            )})`,
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                          <Trophy className="size-9 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        {related.competitionLevel ? (
                          <Badge variant="outline">
                            {competitionLevelLabels[related.competitionLevel]}
                          </Badge>
                        ) : null}

                        {related.rank ? (
                          <Badge variant="secondary">{related.rank}</Badge>
                        ) : null}
                      </div>

                      <CardTitle className="line-clamp-2 text-xl">
                        <Link
                          href={`/prestasi/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {related.winnerName ? (
                        <p className="font-medium">{related.winnerName}</p>
                      ) : null}

                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDate(related.achievementDate)}
                      </p>

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/prestasi/${related.slug}`}>
                          Lihat prestasi
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
