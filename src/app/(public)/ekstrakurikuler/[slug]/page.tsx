import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarClock,
  ImageOff,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogPagesMotionController } from "@/components/motion/catalog-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicExtracurricularBySlug,
  getRelatedPublicExtracurriculars,
} from "@/features/extracurricular/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

type PageParams = {
  slug: string;
};

function createDescription(description: string | null, name: string): string {
  return (description ?? `Informasi kegiatan ekstrakurikuler ${name}.`)
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
  const canonicalPath = `/ekstrakurikuler/${encodeURIComponent(slug)}`;

  const activity = await getPublicExtracurricularBySlug(slug);

  if (!activity) {
    return {
      title: "Ekstrakurikuler Tidak Ditemukan",
    };
  }

  const imageUrl = getSafePublicUrl(activity.imageUrl);

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: activity.name,
    description: createDescription(activity.description, activity.name),

    openGraph: imageUrl
      ? {
          url: canonicalPath,
          title: activity.name,
          description: createDescription(activity.description, activity.name),
          images: [imageUrl],
        }
      : undefined,
  };
}

export default async function ExtracurricularDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const activity = await getPublicExtracurricularBySlug(slug);

  if (!activity) {
    notFound();
  }

  const relatedActivities = await getRelatedPublicExtracurriculars({
    extracurricularId: activity.id,
    targetClasses: activity.targetClasses,
  });

  const imageUrl = getSafePublicUrl(activity.imageUrl);

  return (
    <main>
      <CatalogPagesMotionController pageId="extracurricular-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/ekstrakurikuler">
              <ArrowLeft className="size-4" />
              Kembali ke ekstrakurikuler
            </Link>
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_500px] lg:items-center">
            <div>
              <Badge variant="outline">
                <Sparkles className="size-3.5" />
                Ekstrakurikuler
              </Badge>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {activity.name}
              </h1>

              {activity.description ? (
                <p className="mt-5 line-clamp-4 text-lg leading-8 text-muted-foreground">
                  {activity.description}
                </p>
              ) : null}

              <div className="mt-7 grid gap-3 text-sm sm:grid-cols-2">
                {activity.schedule ? (
                  <div className="flex items-start gap-2">
                    <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />

                    <span>{activity.schedule}</span>
                  </div>
                ) : null}

                {activity.coach ? (
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-primary" />

                    <span>Pembina: {activity.coach}</span>
                  </div>
                ) : null}
              </div>

              {activity.targetClasses.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {activity.targetClasses.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="px-3 py-1.5"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {imageUrl ? (
              <div
                role="img"
                aria-label={`Ekstrakurikuler ${activity.name}`}
                className="aspect-[16/10] rounded-2xl border bg-muted bg-cover bg-center"
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
              <Sparkles className="size-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Informasi Kegiatan
              </p>

              <h2 className="text-2xl font-bold tracking-tight">
                Tentang {activity.name}
              </h2>
            </div>
          </div>

          {activity.description ? (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/85">
              {activity.description}
            </p>
          ) : (
            <p className="mt-7 leading-8 text-muted-foreground">
              Deskripsi lengkap kegiatan belum ditambahkan oleh sekolah.
            </p>
          )}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ringkasan Kegiatan</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4" />
                    Nama kegiatan
                  </dt>

                  <dd className="mt-1 font-medium">{activity.name}</dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="size-4" />
                    Jadwal
                  </dt>

                  <dd className="mt-1 font-medium">
                    {activity.schedule ?? "Belum ditentukan"}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserRound className="size-4" />
                    Pembina
                  </dt>

                  <dd className="mt-1 font-medium">
                    {activity.coach ?? "Belum ditentukan"}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersRound className="size-4" />
                    Kelas sasaran
                  </dt>

                  <dd className="mt-2">
                    {activity.targetClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {activity.targetClasses.map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="font-medium">Semua kelas</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </section>

      {relatedActivities.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <Sparkles className="size-3.5" />
                Kegiatan Lainnya
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Ekstrakurikuler terkait
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedActivities.map((related) => {
                const relatedImage = getSafePublicUrl(related.imageUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/ekstrakurikuler/${related.slug}`}>
                      {relatedImage ? (
                        <div
                          role="img"
                          aria-label={`Ekstrakurikuler ${related.name}`}
                          className="aspect-[16/10] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              relatedImage,
                            )})`,
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                          <Sparkles className="size-9 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        {related.targetClasses.slice(0, 2).map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      <CardTitle className="line-clamp-2 text-xl">
                        <Link
                          href={`/ekstrakurikuler/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {related.description ??
                          "Informasi kegiatan ekstrakurikuler sekolah."}
                      </p>

                      {related.schedule ? (
                        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                          <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />

                          <span>{related.schedule}</span>
                        </div>
                      ) : null}

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/ekstrakurikuler/${related.slug}`}>
                          Lihat kegiatan
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
