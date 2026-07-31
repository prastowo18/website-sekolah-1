import type { Metadata } from "next";
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  ImageOff,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogPagesMotionController } from "@/components/motion/catalog-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicFacilityBySlug,
  getRelatedPublicFacilities,
} from "@/features/facility/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

type PageParams = {
  slug: string;
};

function createDescription(description: string | null, name: string): string {
  return (
    description ?? `Informasi fasilitas ${name} yang tersedia di sekolah.`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function formatCapacity(capacity: string | null): string {
  const normalized = capacity?.trim();

  return normalized || "Belum ditentukan";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  const facility = await getPublicFacilityBySlug(slug);

  if (!facility) {
    return {
      title: "Fasilitas Tidak Ditemukan",
    };
  }

  return {
    title: facility.name,
    description: createDescription(facility.description, facility.name),
  };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const facility = await getPublicFacilityBySlug(slug);

  if (!facility) {
    notFound();
  }

  const relatedFacilities = await getRelatedPublicFacilities({
    facilityId: facility.id,
  });

  const imageUrl = getSafePublicUrl(facility.imageUrl);

  return (
    <main>
      <CatalogPagesMotionController pageId="facility-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/fasilitas">
              <ArrowLeft className="size-4" />
              Kembali ke fasilitas
            </Link>
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_500px] lg:items-center">
            <div>
              <Badge variant="outline">
                <Building2 className="size-3.5" />
                Fasilitas Sekolah
              </Badge>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {facility.name}
              </h1>

              {facility.description ? (
                <p className="mt-5 line-clamp-4 text-lg leading-8 text-muted-foreground">
                  {facility.description}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1.5">
                  <Users className="size-3.5" />
                  Kapasitas {formatCapacity(facility.capacity)}
                </Badge>

                {facility.condition ? (
                  <Badge className="px-3 py-1.5">
                    <ShieldCheck className="size-3.5" />
                    Kondisi {facility.condition}
                  </Badge>
                ) : null}
              </div>
            </div>

            {imageUrl ? (
              <div
                role="img"
                aria-label={`Fasilitas ${facility.name}`}
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
              <DoorOpen className="size-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Informasi Fasilitas
              </p>

              <h2 className="text-2xl font-bold tracking-tight">
                Tentang {facility.name}
              </h2>
            </div>
          </div>

          {facility.description ? (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/85">
              {facility.description}
            </p>
          ) : (
            <p className="mt-7 leading-8 text-muted-foreground">
              Deskripsi lengkap fasilitas belum ditambahkan oleh sekolah.
            </p>
          )}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ringkasan Fasilitas</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="size-4" />
                    Nama fasilitas
                  </dt>

                  <dd className="mt-1 font-medium">{facility.name}</dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    Kapasitas
                  </dt>

                  <dd className="mt-1 font-medium">
                    {formatCapacity(facility.capacity)}
                  </dd>
                </div>

                <div>
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Kondisi
                  </dt>

                  <dd className="mt-1 font-medium">
                    {facility.condition ?? "Belum ditentukan"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </section>

      {relatedFacilities.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <Building2 className="size-3.5" />
                Fasilitas Lainnya
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Sarana sekolah lainnya
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedFacilities.map((related) => {
                const relatedImage = getSafePublicUrl(related.imageUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/fasilitas/${related.slug}`}>
                      {relatedImage ? (
                        <div
                          role="img"
                          aria-label={`Fasilitas ${related.name}`}
                          className="aspect-[16/10] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              relatedImage,
                            )})`,
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-muted">
                          <Building2 className="size-9 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      {related.condition ? (
                        <Badge variant="secondary" className="w-fit">
                          {related.condition}
                        </Badge>
                      ) : null}

                      <CardTitle className="line-clamp-2 text-xl">
                        <Link
                          href={`/fasilitas/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {related.description ?? "Informasi fasilitas sekolah."}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4 text-primary" />
                        {formatCapacity(related.capacity)}
                      </div>

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/fasilitas/${related.slug}`}>
                          Lihat fasilitas
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
