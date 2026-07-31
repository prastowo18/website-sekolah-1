import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  ImageOff,
  Newspaper,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InformationPagesMotionController } from "@/components/motion/information-pages-motion-controller";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostViewTracker } from "@/features/post/components/post-view-tracker";
import {
  getPublicPostBySlug,
  getRelatedPublicPosts,
} from "@/features/post/public-queries";
import { getSafePublicUrl } from "@/lib/public-links";

type PageParams = {
  slug: string;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function createDescription(content: string): string {
  return content.replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description:
      post.seoDescription || post.excerpt || createDescription(post.content),
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPublicPosts({
    postId: post.id,
    categoryId: post.categoryId,
  });

  const imageUrl = getSafePublicUrl(post.featuredImageUrl);

  return (
    <main>
      <InformationPagesMotionController pageId="news-detail" />

      <PostViewTracker slug={post.slug} />

      <article>
        <header className="border-b bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <Button variant="ghost" size="sm" asChild className="-ml-3">
              <Link href="/berita">
                <ArrowLeft className="size-4" />
                Kembali ke berita
              </Link>
            </Button>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {post.category ? (
                <Badge variant="outline">{post.category.name}</Badge>
              ) : null}

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </div>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserRound className="size-4" />
                {post.author?.name ?? "Admin Sekolah"}
              </div>

              <div className="flex items-center gap-2">
                <Eye className="size-4" />
                {post.viewCount} tayangan
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {imageUrl ? (
            <div
              role="img"
              aria-label={post.title}
              className="aspect-[16/9] w-full rounded-2xl border bg-muted bg-cover bg-center"
              style={{
                backgroundImage: `url(${JSON.stringify(imageUrl)})`,
              }}
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl border bg-muted">
              <ImageOff className="size-12 text-muted-foreground" />
            </div>
          )}

          <div className="mt-10 whitespace-pre-wrap break-words text-base leading-8 text-foreground/90">
            {post.content}
          </div>

          <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
            <p>Terakhir diperbarui pada {formatDate(post.updatedAt)}.</p>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 ? (
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <Badge variant="outline">
                <Newspaper className="size-3.5" />
                Berita Terkait
              </Badge>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Informasi lainnya
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((related) => {
                const relatedImage = getSafePublicUrl(related.featuredImageUrl);

                return (
                  <Card key={related.id} className="overflow-hidden">
                    <Link href={`/berita/${related.slug}`}>
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
                          <Newspaper className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    <CardHeader>
                      {related.category ? (
                        <Badge variant="outline" className="w-fit">
                          {related.category.name}
                        </Badge>
                      ) : null}

                      <CardTitle className="line-clamp-2 text-lg">
                        <Link
                          href={`/berita/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {related.excerpt ? (
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {related.excerpt}
                        </p>
                      ) : null}

                      <p className="mt-4 text-xs text-muted-foreground">
                        {formatDate(related.publishedAt ?? related.createdAt)}
                      </p>
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
