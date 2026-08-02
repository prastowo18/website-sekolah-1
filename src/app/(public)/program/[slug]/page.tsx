import type { Metadata } from "next";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  ImageOff,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogPagesMotionController } from "@/components/motion/catalog-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicProgramBySlug,
  getRelatedPublicPrograms,
} from "@/features/program/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";
import { buildPublicShareMetadata } from "@/lib/public-share-metadata";

type PageParams = {
  slug: string;
};

function createDescription(
  shortDescription: string | null,
  description: string | null,
): string {
  const value =
    shortDescription ?? description ?? "Informasi program pendidikan sekolah.";

  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/program/${encodeURIComponent(slug)}`;

  const program = await getPublicProgramBySlug(slug);

  if (!program) {
    return {
      title: "Program Tidak Ditemukan",
    };
  }

  const shareMetadataBase: Metadata = {
    alternates: {
      canonical: canonicalPath,
    },
    title: program.name,
    description: createDescription(
      program.shortDescription,
      program.description,
    ),
  };

  return buildPublicShareMetadata({
    baseMetadata: shareMetadataBase,
    pathname: `/program/${encodeURIComponent(slug)}`,
    imageUrl: program.imageUrl,
    imageAlt: program.name,
    type: "website",
  });
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const program = await getPublicProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const relatedPrograms = await getRelatedPublicPrograms({
    programId: program.id,
  });

  const imageUrl = getSafePublicUrl(program.imageUrl);

  return (
    <main>
      <CatalogPagesMotionController pageId="program-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/program">
              <ArrowLeft className="size-4" />
              Kembali ke program
            </Link>
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
            <div>
              {program.isFeatured ? (
                <Badge>
                  <Sparkles className="size-3.5" />
                  Program Unggulan
                </Badge>
              ) : (
                <Badge variant="outline">
                  <BookOpenCheck className="size-3.5" />
                  Program Pendidikan
                </Badge>
              )}

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {program.name}
              </h1>

              {program.shortDescription ? (
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  {program.shortDescription}
                </p>
              ) : null}
            </div>

            {imageUrl ? (
              <div
                role="img"
                aria-label={`Program ${program.name}`}
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

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
        <article>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Uraian Program
              </p>

              <h2 className="text-2xl font-bold tracking-tight">
                Tentang program
              </h2>
            </div>
          </div>

          {program.description ? (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/85">
              {program.description}
            </p>
          ) : (
            <p className="mt-7 leading-8 text-muted-foreground">
              Uraian lengkap program belum ditambahkan oleh sekolah.
            </p>
          )}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle2 className="size-5 text-primary" />
                Manfaat Program
              </CardTitle>
            </CardHeader>

            <CardContent>
              {program.benefits.length > 0 ? (
                <ul className="grid gap-4">
                  {program.benefits.map((benefit, index) => (
                    <li
                      key={`${index}-${benefit}`}
                      className="flex items-start gap-3"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>

                      <p className="pt-0.5 text-sm leading-6 text-muted-foreground">
                        {benefit}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Daftar manfaat program belum tersedia.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {relatedPrograms.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <BookOpenCheck className="size-3.5" />
                Program Lainnya
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Program pendidikan terkait
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPrograms.map((related) => {
                const relatedImage = getSafePublicUrl(related.imageUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/program/${related.slug}`}>
                      {relatedImage ? (
                        <div
                          role="img"
                          aria-label={`Program ${related.name}`}
                          className="aspect-[16/10] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              relatedImage,
                            )})`,
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                          <BookOpenCheck className="size-9 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      {related.isFeatured ? (
                        <Badge className="w-fit">
                          <Sparkles className="size-3" />
                          Unggulan
                        </Badge>
                      ) : null}

                      <CardTitle className="line-clamp-2 text-xl">
                        <Link
                          href={`/program/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {related.shortDescription ??
                          related.description ??
                          "Informasi program pendidikan sekolah."}
                      </p>

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/program/${related.slug}`}>
                          Lihat program
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
