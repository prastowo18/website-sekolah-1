import type { Metadata } from "next";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  ImageOff,
  School,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TeacherPagesMotionController } from "@/components/motion/teacher-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicTeacherBySlug,
  getRelatedPublicTeachers,
} from "@/features/teacher/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

type PageParams = {
  slug: string;
};

function createDescription(
  biography: string | null,
  name: string,
  position: string | null,
): string {
  return (
    biography ?? `Profil ${name}${position ? ` sebagai ${position}` : ""}.`
  )
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

  const teacher = await getPublicTeacherBySlug(slug);

  if (!teacher) {
    return {
      title: "Guru Tidak Ditemukan",
    };
  }

  const photoUrl = getSafePublicUrl(teacher.photoUrl);

  return {
    title: teacher.name,
    description: createDescription(
      teacher.shortBiography,
      teacher.name,
      teacher.position,
    ),
    openGraph: photoUrl
      ? {
          title: teacher.name,
          description: createDescription(
            teacher.shortBiography,
            teacher.name,
            teacher.position,
          ),
          images: [photoUrl],
        }
      : undefined,
  };
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const teacher = await getPublicTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const relatedTeachers = await getRelatedPublicTeachers({
    teacherId: teacher.id,
    subject: teacher.subject,
  });

  const photoUrl = getSafePublicUrl(teacher.photoUrl);

  return (
    <main>
      <TeacherPagesMotionController pageId="teacher-detail" />

      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="-ml-3">
            <Link href="/guru">
              <ArrowLeft className="size-4" />
              Kembali ke daftar guru
            </Link>
          </Button>

          <div className="mt-8 grid gap-10 lg:grid-cols-[360px_1fr] lg:items-center">
            {photoUrl ? (
              <div
                role="img"
                aria-label={`Foto ${teacher.name}`}
                className="aspect-[4/5] max-w-md rounded-2xl border bg-muted bg-cover bg-center"
                style={{
                  backgroundImage: `url(${JSON.stringify(photoUrl)})`,
                }}
              />
            ) : (
              <div className="flex aspect-[4/5] max-w-md items-center justify-center rounded-2xl border bg-muted">
                <ImageOff className="size-12 text-muted-foreground" />
              </div>
            )}

            <div>
              {teacher.isPrincipal ? (
                <Badge>
                  <School className="size-3.5" />
                  Kepala Sekolah
                </Badge>
              ) : (
                <Badge variant="outline">
                  <UserRound className="size-3.5" />
                  Guru dan Tenaga Pendidikan
                </Badge>
              )}

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
                {teacher.name}
              </h1>

              {teacher.position ? (
                <p className="mt-4 text-xl font-medium text-primary">
                  {teacher.position}
                </p>
              ) : null}

              <div className="mt-7 grid gap-4 text-sm sm:grid-cols-2">
                {teacher.subject ? (
                  <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
                    <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-muted-foreground">
                        Mata pelajaran/bidang
                      </p>

                      <p className="mt-1 font-medium">{teacher.subject}</p>
                    </div>
                  </div>
                ) : null}

                {teacher.education ? (
                  <div className="flex items-start gap-3 rounded-xl border bg-background p-4">
                    <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-muted-foreground">Pendidikan</p>

                      <p className="mt-1 font-medium">{teacher.education}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-16">
        <article>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UsersRound className="size-6" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Profil Pendidikan
              </p>

              <h2 className="text-2xl font-bold tracking-tight">
                Tentang {teacher.name}
              </h2>
            </div>
          </div>

          {teacher.shortBiography ? (
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/85">
              {teacher.shortBiography}
            </p>
          ) : (
            <p className="mt-7 leading-8 text-muted-foreground">
              Biografi singkat belum ditambahkan oleh sekolah.
            </p>
          )}
        </article>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ringkasan Profil</CardTitle>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-5">
                <div>
                  <dt className="text-sm text-muted-foreground">Nama</dt>

                  <dd className="mt-1 font-medium">{teacher.name}</dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Jabatan</dt>

                  <dd className="mt-1 font-medium">
                    {teacher.position ??
                      (teacher.isPrincipal
                        ? "Kepala Sekolah"
                        : "Tenaga Pendidikan")}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">
                    Mata pelajaran/bidang
                  </dt>

                  <dd className="mt-1 font-medium">
                    {teacher.subject ?? "Belum ditentukan"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground">Pendidikan</dt>

                  <dd className="mt-1 font-medium">
                    {teacher.education ?? "Belum ditentukan"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </section>

      {relatedTeachers.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <UsersRound className="size-3.5" />
                Tim Pendidikan
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Guru dan tenaga pendidikan lainnya
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedTeachers.map((related) => {
                const relatedPhoto = getSafePublicUrl(related.photoUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/guru/${related.slug}`}>
                      {relatedPhoto ? (
                        <div
                          role="img"
                          aria-label={`Foto ${related.name}`}
                          className="aspect-[4/5] bg-muted bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${JSON.stringify(
                              relatedPhoto,
                            )})`,
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[4/5] items-center justify-center bg-muted">
                          <UserRound className="size-10 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      {related.isPrincipal ? (
                        <Badge className="w-fit">
                          <School className="size-3" />
                          Kepala Sekolah
                        </Badge>
                      ) : null}

                      <CardTitle className="line-clamp-2 text-xl">
                        <Link
                          href={`/guru/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.name}
                        </Link>
                      </CardTitle>

                      {related.position ? (
                        <p className="text-sm font-medium text-primary">
                          {related.position}
                        </p>
                      ) : null}
                    </CardHeader>

                    <CardContent>
                      {related.subject ? (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <BookOpen className="mt-0.5 size-4 shrink-0 text-primary" />
                          {related.subject}
                        </div>
                      ) : null}

                      <Button
                        variant="link"
                        className="mt-4 h-auto p-0"
                        asChild
                      >
                        <Link href={`/guru/${related.slug}`}>Lihat profil</Link>
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
