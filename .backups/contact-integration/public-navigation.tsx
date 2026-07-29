"use client";

import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getSafePublicUrl } from "@/lib/public-links";

type PublicNavigationProps = {
  schoolName: string;
  shortName?: string | null;
  logoUrl?: string | null;
  hasPpdb: boolean;
};

const navigationItems = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Profil",
    href: "/profil",
  },
  {
    label: "Guru",
    href: "/guru",
  },
  {
    label: "Program",
    href: "/program",
  },
  {
    label: "Fasilitas",
    href: "/fasilitas",
  },
  {
    label: "Ekskul",
    href: "/ekstrakurikuler",
  },
  {
    label: "Prestasi",
    href: "/prestasi",
  },
  {
    label: "Berita",
    href: "/berita",
  },
  {
    label: "Pengumuman",
    href: "/pengumuman",
  },
  {
    label: "Galeri",
    href: "/galeri",
  },
  {
    label: "Dokumen",
    href: "/dokumen",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
] as const;

export function PublicNavigation({
  schoolName,
  shortName,
  logoUrl,
  hasPpdb,
}: PublicNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const safeLogoUrl = getSafePublicUrl(logoUrl);

  function isActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/ppdb") {
      return pathname.startsWith("/ppdb");
    }

    if (href === "/berita") {
      return pathname.startsWith("/berita");
    }

    if (href === "/galeri") {
      return pathname.startsWith("/galeri");
    }

    if (href === "/dokumen") {
      return pathname.startsWith("/dokumen");
    }

    if (href === "/profil") {
      return pathname.startsWith("/profil");
    }

    if (href === "/program") {
      return pathname.startsWith("/program");
    }

    if (href === "/fasilitas") {
      return pathname.startsWith("/fasilitas");
    }

    if (href === "/prestasi") {
      return pathname.startsWith("/prestasi");
    }

    if (href === "/ekstrakurikuler") {
      return pathname.startsWith("/ekstrakurikuler");
    }

    if (href === "/guru") {
      return pathname.startsWith("/guru");
    }

    if (href === "/pengumuman") {
      return pathname.startsWith("/pengumuman");
    }

    if (href === "/faq") {
      return pathname.startsWith("/faq");
    }

    return false;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={() => {
            setOpen(false);
          }}
        >
          {safeLogoUrl ? (
            <div
              role="img"
              aria-label={`Logo ${schoolName}`}
              className="size-10 shrink-0 rounded-lg border bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${JSON.stringify(safeLogoUrl)})`,
              }}
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold sm:text-base">
              {shortName || schoolName}
            </p>

            {shortName ? (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {schoolName}
              </p>
            ) : null}
          </div>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 2xl:flex"
        >
          {navigationItems.map((item) => (
            <Button key={item.href} variant="ghost" size="sm" asChild>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={isActive(item.href) ? "text-primary" : undefined}
              >
                {item.label}
              </Link>
            </Button>
          ))}

          {hasPpdb ? (
            <Button size="sm" className="ml-2" asChild>
              <Link href="/ppdb">Informasi PPDB</Link>
            </Button>
          ) : null}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="2xl:hidden"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={open}
          onClick={() => {
            setOpen((current) => !current);
          }}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t bg-background 2xl:hidden">
          <nav
            aria-label="Navigasi mobile"
            className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6"
          >
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="justify-start"
                asChild
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              </Button>
            ))}

            {hasPpdb ? (
              <Button className="mt-2" asChild>
                <Link
                  href="/ppdb"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Informasi PPDB
                </Link>
              </Button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
