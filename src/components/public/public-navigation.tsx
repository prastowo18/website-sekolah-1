"use client";

import { ChevronDown, GraduationCap, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const motionEase = [0.16, 1, 0.3, 1] as const;

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

function ActiveNavigationIndicator({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <m.span
      aria-hidden="true"
      initial={{
        opacity: 0,
        scaleX: 0.2,
      }}
      animate={{
        opacity: 1,
        scaleX: 1,
      }}
      transition={{
        duration: 0.35,
        ease: motionEase,
      }}
      className="pointer-events-none absolute inset-x-3 -bottom-1 h-0.5 origin-center rounded-full bg-primary"
    />
  );
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

  const [scrolled, setScrolled] = useState(false);

  const safeLogoUrl = getSafePublicUrl(logoUrl);

  const shouldReduceMotion = Boolean(useReducedMotion());

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latestPosition) => {
    const nextScrolled = latestPosition > 24;

    setScrolled((currentScrolled) =>
      currentScrolled === nextScrolled ? currentScrolled : nextScrolled,
    );
  });

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setActiveDesktopGroup(null);
        setActiveMobileGroup(null);
        setMobileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setActiveDesktopGroup(null);
      setActiveMobileGroup(null);
      setMobileOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeNavigation(): void {
    setMobileOpen(false);
    setActiveDesktopGroup(null);
    setActiveMobileGroup(null);
  }

  function toggleMobileNavigation(): void {
    const nextOpen = !mobileOpen;

    setMobileOpen(nextOpen);
    setActiveDesktopGroup(null);

    if (nextOpen) {
      setActiveMobileGroup(getActiveGroupLabel(pathname));
    } else {
      setActiveMobileGroup(null);
    }
  }

  const homeActive = isPathActive(pathname, "/");

  const ppdbActive = isPathActive(pathname, "/ppdb");

  return (
    <>
      <>
        <header
          ref={navigationRef}
          className={cn(
            "sticky top-0 z-50 isolate border-b backdrop-blur-xl",
            "transition-[background-color,border-color,box-shadow] duration-300",
            scrolled
              ? "border-border bg-background/95 shadow-md supports-backdrop-filter:bg-background/90"
              : "border-border/70 bg-background/90 supports-backdrop-filter:bg-background/85",
          )}
          data-scrolled={scrolled ? "true" : "false"}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <m.div
              animate={{
                scale: scrolled ? 0.97 : 1,
                x: scrolled ? -2 : 0,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.3,
                ease: motionEase,
              }}
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: 1.015,
                    }
              }
              className="min-w-0 origin-left"
            >
              <Link
                href="/"
                className="flex min-w-0 items-center gap-3"
                onClick={closeNavigation}
              >
                <m.div
                  animate={{
                    scale: scrolled ? 0.92 : 1,
                    rotate: scrolled ? -1 : 0,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.32,
                    ease: motionEase,
                  }}
                  className="shrink-0"
                >
                  {safeLogoUrl ? (
                    <div
                      role="img"
                      aria-label={`Logo ${schoolName}`}
                      className="size-10 rounded-lg border bg-contain bg-center bg-no-repeat shadow-sm"
                      style={{
                        backgroundImage: `url(${JSON.stringify(safeLogoUrl)})`,
                      }}
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <GraduationCap className="size-6" />
                    </div>
                  )}
                </m.div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold sm:text-base">
                    {shortName || schoolName}
                  </p>

                  {shortName ? (
                    <m.p
                      animate={{
                        opacity: scrolled ? 0.72 : 1,
                        y: scrolled ? -1 : 0,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.25,
                      }}
                      className="hidden truncate text-xs text-muted-foreground sm:block"
                    >
                      {schoolName}
                    </m.p>
                  ) : null}
                </div>
              </Link>
            </m.div>

            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-1 lg:flex"
            >
              <m.div
                className="relative"
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -2,
                      }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: 0.97,
                      }
                }
              >
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/"
                    aria-current={homeActive ? "page" : undefined}
                    className={
                      homeActive
                        ? "bg-accent font-semibold text-primary"
                        : undefined
                    }
                    onClick={closeNavigation}
                  >
                    Beranda
                  </Link>
                </Button>

                <ActiveNavigationIndicator active={homeActive} />
              </m.div>

              {navigationGroups.map((group, groupIndex) => {
                const isOpen = activeDesktopGroup === group.label;

                const groupActive = isGroupActive(pathname, group);

                const menuId = `desktop-navigation-group-${groupIndex}`;

                return (
                  <m.div
                    key={group.label}
                    className="relative"
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -2,
                          }
                    }
                    transition={{
                      duration: 0.2,
                      ease: motionEase,
                    }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      aria-controls={menuId}
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

                      <m.span
                        animate={{
                          rotate: isOpen ? 180 : 0,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.25,
                          ease: motionEase,
                        }}
                        className="flex"
                      >
                        <ChevronDown className="size-4" />
                      </m.span>
                    </Button>

                    <ActiveNavigationIndicator active={groupActive} />

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <m.div
                          id={menuId}
                          key={menuId}
                          role="menu"
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: -10,
                                  scale: 0.96,
                                }
                          }
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={
                            shouldReduceMotion
                              ? {
                                  opacity: 0,
                                }
                              : {
                                  opacity: 0,
                                  y: -8,
                                  scale: 0.97,
                                }
                          }
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.24,
                            ease: motionEase,
                          }}
                          className="absolute left-0 top-full z-50 mt-2 min-w-64 origin-top-left rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
                        >
                          {group.items.map((item, itemIndex) => {
                            const active = isPathActive(pathname, item.href);

                            return (
                              <m.div
                                key={item.href}
                                initial={
                                  shouldReduceMotion
                                    ? false
                                    : {
                                        opacity: 0,
                                        x: -8,
                                      }
                                }
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                }}
                                transition={{
                                  duration: shouldReduceMotion ? 0 : 0.22,
                                  delay: shouldReduceMotion
                                    ? 0
                                    : itemIndex * 0.035,
                                  ease: motionEase,
                                }}
                                whileHover={
                                  shouldReduceMotion
                                    ? undefined
                                    : {
                                        x: 4,
                                      }
                                }
                              >
                                <Link
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
                              </m.div>
                            );
                          })}
                        </m.div>
                      ) : null}
                    </AnimatePresence>
                  </m.div>
                );
              })}

              {hasPpdb ? (
                <m.div
                  className="relative ml-2"
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.02,
                        }
                  }
                  whileTap={
                    shouldReduceMotion
                      ? undefined
                      : {
                          scale: 0.97,
                        }
                  }
                >
                  <Button
                    size="sm"
                    className={
                      ppdbActive
                        ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                        : undefined
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
                </m.div>
              ) : null}
            </nav>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative overflow-hidden lg:hidden"
              aria-label={
                mobileOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
              }
              aria-expanded={mobileOpen}
              aria-controls="public-mobile-navigation"
              onClick={toggleMobileNavigation}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <m.span
                    key="close-navigation"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            rotate: -90,
                            scale: 0.7,
                          }
                    }
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: 90,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      ease: motionEase,
                    }}
                    className="flex"
                  >
                    <X className="size-5" />
                  </m.span>
                ) : (
                  <m.span
                    key="open-navigation"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            rotate: 90,
                            scale: 0.7,
                          }
                    }
                    animate={{
                      opacity: 1,
                      rotate: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      rotate: -90,
                      scale: 0.7,
                    }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      ease: motionEase,
                    }}
                    className="flex"
                  >
                    <Menu className="size-5" />
                  </m.span>
                )}
              </AnimatePresence>
            </Button>
          </div>

          <AnimatePresence initial={false}>
            {mobileOpen ? (
              <m.div
                id="public-mobile-navigation"
                key="public-mobile-navigation"
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        height: 0,
                        y: -12,
                      }
                }
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={
                  shouldReduceMotion
                    ? {
                        opacity: 0,
                        height: 0,
                      }
                    : {
                        opacity: 0,
                        height: 0,
                        y: -10,
                      }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.3,
                  ease: motionEase,
                }}
                className="absolute inset-x-0 top-full overflow-hidden border-t bg-background shadow-xl lg:hidden"
              >
                <nav
                  aria-label="Navigasi mobile"
                  className="mx-auto max-h-[calc(100svh-4rem)] max-w-7xl overflow-y-auto px-4 py-4 sm:px-6"
                >
                  <div className="grid gap-1">
                    <m.div
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                              x: -12,
                            }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.25,
                        ease: motionEase,
                      }}
                    >
                      <Button
                        variant="ghost"
                        className={
                          homeActive
                            ? "w-full justify-start bg-accent font-semibold text-primary"
                            : "w-full justify-start"
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
                    </m.div>

                    {navigationGroups.map((group, groupIndex) => {
                      const isOpen = activeMobileGroup === group.label;

                      const groupActive = isGroupActive(pathname, group);

                      const mobileGroupId = `mobile-navigation-group-${groupIndex}`;

                      return (
                        <m.div
                          key={group.label}
                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  x: -12,
                                }
                          }
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.25,
                            delay: shouldReduceMotion
                              ? 0
                              : (groupIndex + 1) * 0.045,
                            ease: motionEase,
                          }}
                          className="rounded-lg"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            className={
                              groupActive
                                ? "w-full justify-between bg-accent font-semibold text-primary"
                                : "w-full justify-between"
                            }
                            aria-expanded={isOpen}
                            aria-controls={mobileGroupId}
                            onClick={() => {
                              setActiveMobileGroup(isOpen ? null : group.label);
                            }}
                          >
                            {group.label}

                            <m.span
                              animate={{
                                rotate: isOpen ? 180 : 0,
                              }}
                              transition={{
                                duration: shouldReduceMotion ? 0 : 0.24,
                                ease: motionEase,
                              }}
                              className="flex"
                            >
                              <ChevronDown className="size-4" />
                            </m.span>
                          </Button>

                          <AnimatePresence initial={false}>
                            {isOpen ? (
                              <m.div
                                id={mobileGroupId}
                                key={mobileGroupId}
                                initial={
                                  shouldReduceMotion
                                    ? false
                                    : {
                                        opacity: 0,
                                        height: 0,
                                      }
                                }
                                animate={{
                                  opacity: 1,
                                  height: "auto",
                                }}
                                exit={{
                                  opacity: 0,
                                  height: 0,
                                }}
                                transition={{
                                  duration: shouldReduceMotion ? 0 : 0.26,
                                  ease: motionEase,
                                }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 mt-1 grid gap-1 border-l pl-3">
                                  {group.items.map((item, itemIndex) => {
                                    const active = isPathActive(
                                      pathname,
                                      item.href,
                                    );

                                    return (
                                      <m.div
                                        key={item.href}
                                        initial={
                                          shouldReduceMotion
                                            ? false
                                            : {
                                                opacity: 0,
                                                x: -8,
                                              }
                                        }
                                        animate={{
                                          opacity: 1,
                                          x: 0,
                                        }}
                                        transition={{
                                          duration: shouldReduceMotion
                                            ? 0
                                            : 0.2,
                                          delay: shouldReduceMotion
                                            ? 0
                                            : itemIndex * 0.035,
                                          ease: motionEase,
                                        }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={
                                            active
                                              ? "w-full justify-start bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                              : "w-full justify-start"
                                          }
                                          asChild
                                        >
                                          <Link
                                            href={item.href}
                                            aria-current={
                                              active ? "page" : undefined
                                            }
                                            onClick={closeNavigation}
                                          >
                                            {item.label}
                                          </Link>
                                        </Button>
                                      </m.div>
                                    );
                                  })}
                                </div>
                              </m.div>
                            ) : null}
                          </AnimatePresence>
                        </m.div>
                      );
                    })}

                    {hasPpdb ? (
                      <m.div
                        initial={
                          shouldReduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 12,
                              }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.28,
                          delay: shouldReduceMotion ? 0 : 0.2,
                          ease: motionEase,
                        }}
                      >
                        <Button
                          className={
                            ppdbActive
                              ? "mt-3 w-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                              : "mt-3 w-full"
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
                      </m.div>
                    ) : null}
                  </div>
                </nav>
              </m.div>
            ) : null}
          </AnimatePresence>
        </header>
      </>
    </>
  );
}
