import type { Metadata } from "next";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Tags,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPublicFaqCategories,
  getPublicFaqList,
} from "@/features/faq/public-queries";
import { getPublicSchoolProfile } from "@/features/public-site/queries";
import { toPhoneHref, toWhatsAppHref } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Pertanyaan Umum",
  description:
    "Jawaban atas pertanyaan umum mengenai sekolah, kegiatan, pelayanan, pembelajaran, dan informasi PPDB.",
};

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  page?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizePage(value: string): number {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildHref({
  q,
  category,
  page,
}: {
  q: string;
  category: string;
  page: number;
}): string {
  const parameters = new URLSearchParams();

  if (q) {
    parameters.set("q", q);
  }

  if (category) {
    parameters.set("category", category);
  }

  if (page > 1) {
    parameters.set("page", String(page));
  }

  const query = parameters.toString();

  return query ? `/faq?${query}` : "/faq";
}

export default async function PublicFaqPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parameters = await searchParams;

  const q = firstValue(parameters.q).trim().slice(0, 100);

  const requestedCategory = firstValue(parameters.category)
    .trim()
    .slice(0, 100);

  const requestedPage = normalizePage(firstValue(parameters.page));

  const [categories, profile] = await Promise.all([
    getPublicFaqCategories(),
    getPublicSchoolProfile(),
  ]);

  const category = categories.includes(requestedCategory)
    ? requestedCategory
    : "";

  const result = await getPublicFaqList({
    q,
    category,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  type FaqItem = (typeof result.faqs)[number];

  const groupedFaqs = new Map<string, FaqItem[]>();

  for (const faq of result.faqs) {
    const categoryName = faq.category?.trim() || "Umum";

    const currentItems = groupedFaqs.get(categoryName) ?? [];

    currentItems.push(faq);
    groupedFaqs.set(categoryName, currentItems);
  }

  const firstItem =
    result.total === 0 ? 0 : (result.currentPage - 1) * PAGE_SIZE + 1;

  const lastItem = Math.min(result.currentPage * PAGE_SIZE, result.total);

  const whatsappHref = profile?.whatsapp
    ? toWhatsAppHref(
        profile.whatsapp,
        `Halo ${profile.schoolName}, saya ingin menanyakan informasi mengenai sekolah.`,
      )
    : null;

  const phoneHref = profile?.phone ? toPhoneHref(profile.phone) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: result.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main>
      {result.faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <CircleHelp className="size-3.5" />
              Pusat Bantuan
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Temukan jawaban mengenai kegiatan sekolah, pembelajaran,
              pelayanan, fasilitas, administrasi, dan informasi PPDB.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-3 lg:grid-cols-[1fr_260px_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Cari pertanyaan atau jawaban..."
                  className="pl-9"
                  maxLength={100}
                />
              </div>

              <Select name="category" defaultValue={category || "all"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>

                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit">
                <Search className="size-4" />
                Cari
              </Button>

              {q || category ? (
                <Button variant="outline" asChild>
                  <Link href="/faq">
                    <RotateCcw className="size-4" />
                    Reset
                  </Link>
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {result.faqs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
            <CircleHelp className="mx-auto size-10 text-muted-foreground" />

            <h2 className="mt-4 text-xl font-semibold">
              Pertanyaan tidak ditemukan
            </h2>

            <p className="mt-2 text-muted-foreground">
              Belum ada FAQ aktif yang sesuai dengan pencarian atau kategori
              tersebut.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {Array.from(groupedFaqs.entries()).map(
              ([categoryName, faqItems]) => (
                <section
                  key={categoryName}
                  aria-labelledby={`faq-${categoryName}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Tags className="size-5" />
                    </div>

                    <div>
                      <h2
                        id={`faq-${categoryName}`}
                        className="text-2xl font-bold tracking-tight"
                      >
                        {categoryName}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {faqItems.length} pertanyaan
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {faqItems.map((faq, index) => (
                      <details
                        key={faq.id}
                        className="group overflow-hidden rounded-xl border bg-card open:border-primary/30 open:shadow-sm"
                        open={index === 0 && groupedFaqs.size === 1}
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 font-semibold transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                          <span className="leading-7">{faq.question}</span>

                          <ChevronDown className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                        </summary>

                        <div className="border-t px-5 py-5">
                          <p className="whitespace-pre-line break-words leading-7 text-muted-foreground">
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Menampilkan {firstItem}–{lastItem} dari {result.total} pertanyaan.
          </p>

          <div className="flex items-center gap-2">
            {result.currentPage > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    category,
                    page: result.currentPage - 1,
                  })}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>
            )}

            <span className="min-w-24 text-center">
              Halaman {result.currentPage} dari {result.totalPages}
            </span>

            {result.currentPage < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={buildHref({
                    q,
                    category,
                    page: result.currentPage + 1,
                  })}
                >
                  Berikutnya
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Berikutnya
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {(whatsappHref || phoneHref || profile?.email) && (
          <Card className="mt-12 border-primary/30 bg-primary/[0.025]">
            <CardHeader>
              <CardTitle className="text-2xl">
                Belum menemukan jawaban?
              </CardTitle>

              <p className="leading-7 text-muted-foreground">
                Hubungi sekolah melalui kanal resmi untuk memperoleh informasi
                lebih lanjut.
              </p>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-3">
              {whatsappHref ? (
                <Button asChild>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    WhatsApp Sekolah
                  </a>
                </Button>
              ) : null}

              {phoneHref && profile?.phone ? (
                <Button variant="outline" asChild>
                  <a href={phoneHref}>
                    <Phone className="size-4" />
                    {profile.phone}
                  </a>
                </Button>
              ) : null}

              {profile?.email ? (
                <Button variant="outline" asChild>
                  <a href={`mailto:${profile.email}`}>
                    <Mail className="size-4" />
                    Email Sekolah
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
