"use client";

import { ChevronDown, GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getSafePublicUrl } from "@/lib/public-links";

type PublicNavigationProps = {
  schoolName: string;
  shortName?: string | null;
  logoUrl?: string | null;
  hasPpdb: boolean;
};

type NavigationLink = {
  label: string;
  href: string;
};

type NavigationGroup = {
  label: string;
  items: readonly NavigationLink[];
};

const navigationGroups = [
  {
    label: "Tentang Sekolah",
    items: [
      {
        label: "Profil Sekolah",
        href: "/profil",
      },
      {
        label: "Guru dan Tenaga Pendidikan",
        href: "/guru",
      },
      {
        label: "Fasilitas",
        href: "/fasilitas",
      },
    ],
  },
  {
    label: "Akademik & Kegiatan",
    items: [
      {
        label: "Program Unggulan",
        href: "/program",
      },
      {
        label: "Ekstrakurikuler",
        href: "/ekstrakurikuler",
      },
      {
        label: "Prestasi",
        href: "/prestasi",
      },
    ],
  },
  {
    label: "Informasi",
    items: [
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
    ],
  },
  {
    label: "Layanan",
    items: [
      {
        label: "Pertanyaan Umum",
        href: "/faq",
      },
      {
        label: "Kontak",
        href: "/kontak",
      },
    ],
  },
] as const satisfies readonly NavigationGroup[];

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, group: NavigationGroup): boolean {
  return group.items.some((item) => isPathActive(pathname, item.href));
}

function getActiveGroupLabel(pathname: string): string | null {
  const activeGroup = navigationGroups.find((group) =>
    isGroupActive(pathname, group),
  );

  return activeGroup?.label ?? null;
}

export function PublicNavigation({
  schoolName,
  shortName,
  logoUrl,
  hasPpdb,
}: PublicNavigationProps) {
  const pathname = usePathname();

  const navigationRef = useRef<HTMLElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const [activeDesktopGroup, setActiveDesktopGroup] = useState<string | null>(
    null,
  );

  const [activeMobileGroup, setActiveMobileGroup] = useState<string | null>(
    null,
  );

  const safeLogoUrl = getSafePublicUrl(logoUrl);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setActiveDesktopGroup(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveDesktopGroup(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeNavigation() {
    setMobileOpen(false);
    setActiveDesktopGroup(null);
    setActiveMobileGroup(null);
  }

  function toggleMobileNavigation() {
    const nextOpen = !mobileOpen;

    setMobileOpen(nextOpen);

    if (nextOpen) {
      setActiveMobileGroup(getActiveGroupLabel(pathname));
    } else {
      setActiveMobileGroup(null);
    }
  }

  const homeActive = isPathActive(pathname, "/");

  const ppdbActive = isPathActive(pathname, "/ppdb");

  return (
    <header
      ref={navigationRef}
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          onClick={closeNavigation}
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
          className="hidden items-center gap-1 lg:flex"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/"
              aria-current={homeActive ? "page" : undefined}
              className={
                homeActive ? "bg-accent font-semibold text-primary" : undefined
              }
              onClick={closeNavigation}
            >
              Beranda
            </Link>
          </Button>

          {navigationGroups.map((group) => {
            const isOpen = activeDesktopGroup === group.label;

            const groupActive = isGroupActive(pathname, group);

            return (
              <div key={group.label} className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  className={
                    groupActive
                      ? "bg-accent font-semibold text-primary"
                      : undefined
                  }
                  onClick={() => {
                    setActiveDesktopGroup(isOpen ? null : group.label);
                  }}
                >
                  {group.label}

                  <ChevronDown
                    className={
                      isOpen
                        ? "size-4 rotate-180 transition-transform"
                        : "size-4 transition-transform"
                    }
                  />
                </Button>

                {isOpen ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg"
                  >
                    {group.items.map((item) => {
                      const active = isPathActive(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                          className={
                            active
                              ? "flex rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                              : "flex rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          }
                          onClick={closeNavigation}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {hasPpdb ? (
            <Button
              size="sm"
              className={
                ppdbActive
                  ? "ml-2 ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  : "ml-2"
              }
              asChild
            >
              <Link
                href="/ppdb"
                aria-current={ppdbActive ? "page" : undefined}
                onClick={closeNavigation}
              >
                Informasi PPDB
              </Link>
            </Button>
          ) : null}
        </nav>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={mobileOpen}
          onClick={toggleMobileNavigation}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {mobileOpen ? (
        <div className="border-t bg-background lg:hidden">
          <nav
            aria-label="Navigasi mobile"
            className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl overflow-y-auto px-4 py-4 sm:px-6"
          >
            <div className="grid gap-1">
              <Button
                variant="ghost"
                className={
                  homeActive
                    ? "justify-start bg-accent font-semibold text-primary"
                    : "justify-start"
                }
                asChild
              >
                <Link
                  href="/"
                  aria-current={homeActive ? "page" : undefined}
                  onClick={closeNavigation}
                >
                  Beranda
                </Link>
              </Button>

              {navigationGroups.map((group) => {
                const isOpen = activeMobileGroup === group.label;

                const groupActive = isGroupActive(pathname, group);

                return (
                  <div key={group.label} className="rounded-lg">
                    <Button
                      type="button"
                      variant="ghost"
                      className={
                        groupActive
                          ? "w-full justify-between bg-accent font-semibold text-primary"
                          : "w-full justify-between"
                      }
                      aria-expanded={isOpen}
                      onClick={() => {
                        setActiveMobileGroup(isOpen ? null : group.label);
                      }}
                    >
                      {group.label}

                      <ChevronDown
                        className={
                          isOpen
                            ? "size-4 rotate-180 transition-transform"
                            : "size-4 transition-transform"
                        }
                      />
                    </Button>

                    {isOpen ? (
                      <div className="ml-4 mt-1 grid gap-1 border-l pl-3">
                        {group.items.map((item) => {
                          const active = isPathActive(pathname, item.href);

                          return (
                            <Button
                              key={item.href}
                              variant="ghost"
                              size="sm"
                              className={
                                active
                                  ? "justify-start bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                  : "justify-start"
                              }
                              asChild
                            >
                              <Link
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                onClick={closeNavigation}
                              >
                                {item.label}
                              </Link>
                            </Button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {hasPpdb ? (
                <Button
                  className={
                    ppdbActive
                      ? "mt-3 ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                      : "mt-3"
                  }
                  asChild
                >
                  <Link
                    href="/ppdb"
                    aria-current={ppdbActive ? "page" : undefined}
                    onClick={closeNavigation}
                  >
                    Informasi PPDB
                  </Link>
                </Button>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
