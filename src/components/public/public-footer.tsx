import { FooterSocialPlatformIcon } from '@/components/public/footer-social-platform-icon';
import { FooterSocialLinks } from '@/components/public/footer-social-links';

import { Clock3, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import {
  getSafePublicUrl,
  toPhoneHref,
  toWhatsAppHref,
} from '@/lib/public-links';

type PublicFooterProps = {
  profile: {
    schoolName: string;
    shortName: string | null;
    npsn: string | null;
    accreditation: string | null;
    tagline: string | null;
    address: string | null;
    village: string | null;
    district: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    operationalHours: string | null;
  };

  socialLinks: Array<{
    id: string;
    platform: string;
    label: string | null;
    url: string;
  }>;
};

function buildAddress(profile: PublicFooterProps['profile']): string {
  return [
    profile.address,
    profile.village,
    profile.district,
    profile.city,
    profile.province,
    profile.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
}

export function PublicFooter({ profile, socialLinks }: PublicFooterProps) {
  const address = buildAddress(profile);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="text-lg font-bold">
            {profile.shortName || profile.schoolName}
          </p>

          {profile.tagline ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {profile.tagline}
            </p>
          ) : null}

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            {profile.npsn ? <p>NPSN: {profile.npsn}</p> : null}

            {profile.accreditation ? (
              <p>Akreditasi: {profile.accreditation}</p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="font-semibold">Navigasi</p>

          <div className="mt-4 grid gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Beranda
            </Link>

            <Link
              href="/profil"
              className="text-muted-foreground hover:text-foreground"
            >
              Profil Sekolah
            </Link>

            <Link
              href="/guru"
              className="text-muted-foreground hover:text-foreground"
            >
              Guru dan Tenaga Pendidikan
            </Link>

            <Link
              href="/program"
              className="text-muted-foreground hover:text-foreground"
            >
              Program Unggulan
            </Link>

            <Link
              href="/fasilitas"
              className="text-muted-foreground hover:text-foreground"
            >
              Fasilitas
            </Link>

            <Link
              href="/ekstrakurikuler"
              className="text-muted-foreground hover:text-foreground"
            >
              Ekstrakurikuler
            </Link>

            <Link
              href="/prestasi"
              className="text-muted-foreground hover:text-foreground"
            >
              Prestasi
            </Link>

            <Link
              href="/berita"
              className="text-muted-foreground hover:text-foreground"
            >
              Berita
            </Link>

            <Link
              href="/pengumuman"
              className="text-muted-foreground hover:text-foreground"
            >
              Pengumuman
            </Link>

            <Link
              href="/galeri"
              className="text-muted-foreground hover:text-foreground"
            >
              Galeri
            </Link>

            <Link
              href="/dokumen"
              className="text-muted-foreground hover:text-foreground"
            >
              Dokumen
            </Link>

            <Link
              href="/faq"
              className="text-muted-foreground hover:text-foreground"
            >
              Pertanyaan Umum
            </Link>

            <Link
              href="/kontak"
              className="text-muted-foreground hover:text-foreground"
            >
              Kontak
            </Link>

            <Link
              href="/testimoni"
              className="text-muted-foreground hover:text-foreground"
            >
              Testimoni
            </Link>

            <Link
              href="/ppdb"
              className="text-muted-foreground hover:text-foreground"
            >
              Informasi PPDB
            </Link>
          </div>
        </div>

        <div>
          <p className="font-semibold">Kontak Sekolah</p>

          <div className="mt-4 grid gap-3 text-sm">
            {address ? (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />

                <span>{address}</span>
              </div>
            ) : null}

            {profile.phone ? (
              <a
                href={toPhoneHref(profile.phone)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-4 shrink-0" />

                {profile.phone}
              </a>
            ) : null}

            {profile.email ? (
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center gap-2 break-all text-muted-foreground hover:text-foreground"
              >
                <Mail className="size-4 shrink-0" />

                {profile.email}
              </a>
            ) : null}

            {profile.operationalHours ? (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock3 className="mt-0.5 size-4 shrink-0" />

                <span>{profile.operationalHours}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <p className="font-semibold">Kanal Resmi</p>

          <div className="mt-4 grid gap-2 text-sm">
            {profile.whatsapp ? (
              <a
                href={toWhatsAppHref(
                  profile.whatsapp,
                  `Halo ${profile.schoolName}, saya ingin memperoleh informasi lebih lanjut.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <FooterSocialPlatformIcon
                  href={toWhatsAppHref(
                    profile.whatsapp,
                    `Halo ${profile.schoolName}, saya ingin memperoleh informasi lebih lanjut.`,
                  )}
                  label="WhatsApp"
                  className="size-4 shrink-0"
                />

                <span>WhatsApp</span>

                <ExternalLink
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
              </a>
            ) : null}

            {socialLinks.map((link) => {
              const safeUrl = getSafePublicUrl(link.url);

              if (!safeUrl) {
                return null;
              }

              return (
                <a
                  key={link.id}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <FooterSocialPlatformIcon
                    href={safeUrl}
                    label={link.label || link.platform}
                    className="size-4 shrink-0"
                  />
                  {link.label || link.platform}

                  <ExternalLink className="size-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <p>
            © {year} {profile.schoolName}. Seluruh hak dilindungi.
          </p>

          <p>Website profil dan pusat informasi resmi sekolah.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FooterSocialLinks links={socialLinks} />
      </div>
    </footer>
  );
}
