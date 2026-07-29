import type { Metadata } from "next";
import {
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Phone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicContactForm } from "@/features/contact-message/components/public-contact-form";
import { getPublicSchoolProfile } from "@/features/public-site/queries";
import { toPhoneHref, toWhatsAppHref } from "@/lib/public-links";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi sekolah untuk mendapatkan informasi mengenai kegiatan, pelayanan, program pendidikan, dan PPDB.",
};

export default async function ContactPage() {
  const profile = await getPublicSchoolProfile();

  const phoneHref = profile?.phone ? toPhoneHref(profile.phone) : null;

  const whatsappHref = profile?.whatsapp
    ? toWhatsAppHref(
        profile.whatsapp,
        `Halo ${profile.schoolName}, saya ingin menanyakan informasi mengenai sekolah.`,
      )
    : null;

  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="outline">
              <MessagesSquare className="size-3.5" />
              Hubungi Sekolah
            </Badge>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              Kontak
            </h1>

            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Kirim pertanyaan melalui formulir atau hubungi sekolah melalui
              kanal resmi yang tersedia.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8 lg:py-14">
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sekolah</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {profile?.phone && phoneHref ? (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium">Telepon</p>

                    <a
                      href={phoneHref}
                      className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                    >
                      {profile.phone}
                    </a>
                  </div>
                </div>
              ) : null}

              {profile?.whatsapp && whatsappHref ? (
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div>
                    <p className="font-medium">WhatsApp</p>

                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-muted-foreground hover:text-primary"
                    >
                      {profile.whatsapp}
                    </a>
                  </div>
                </div>
              ) : null}

              {profile?.email ? (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div className="min-w-0">
                    <p className="font-medium">Email</p>

                    <a
                      href={`mailto:${profile.email}`}
                      className="mt-1 block break-all text-sm text-muted-foreground hover:text-primary"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              ) : null}

              {!profile?.phone && !profile?.whatsapp && !profile?.email ? (
                <div className="rounded-lg border border-dashed p-5 text-sm leading-6 text-muted-foreground">
                  Informasi kontak sekolah belum diisi oleh administrator.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/[0.025]">
            <CardContent className="pt-6">
              <MapPin className="size-6 text-primary" />

              <h2 className="mt-4 font-semibold">Kunjungan ke Sekolah</h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Hubungi sekolah terlebih dahulu untuk memastikan jadwal
                pelayanan dan kunjungan.
              </p>
            </CardContent>
          </Card>

          {whatsappHref ? (
            <Button className="w-full" asChild>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                Hubungi melalui WhatsApp
              </a>
            </Button>
          ) : null}
        </aside>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Kirim Pesan</CardTitle>

            <p className="leading-7 text-muted-foreground">
              Sekolah akan meninjau pesan dan memberikan tanggapan melalui email
              atau nomor telepon yang dicantumkan.
            </p>
          </CardHeader>

          <CardContent>
            <PublicContactForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
