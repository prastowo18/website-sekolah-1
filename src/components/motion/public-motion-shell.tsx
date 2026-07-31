"use client";

import { ArrowUp } from "lucide-react";
import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type PublicMotionShellProps = {
  children: ReactNode;
};

/**
 * Efek global untuk halaman publik.
 *
 * Seluruh children tetap berasal dari render server. Motion hanya mengatur
 * presentasi visual berupa opacity dan transform, sehingga struktur konten,
 * heading, link, dan metadata tetap tersedia pada HTML.
 */
export function PublicMotionShell({ children }: PublicMotionShellProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const { scrollY, scrollYProgress } = useScroll();

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    mass: 0.2,
    restDelta: 0.001,
  });

  const [showBackToTop, setShowBackToTop] = useState(false);

  useMotionValueEvent(scrollY, "change", (latestScrollPosition) => {
    const nextValue = latestScrollPosition > 640;

    setShowBackToTop((currentValue) =>
      currentValue === nextValue ? currentValue : nextValue,
    );
  });

  function handleBackToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <>
      <>
        {!shouldReduceMotion ? (
          <m.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-100 h-1 origin-left bg-primary"
            style={{
              scaleX: smoothScrollProgress,
            }}
          />
        ) : null}

        <m.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0.42,
                  y: 24,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.58,
            ease: [0.16, 1, 0.3, 1],
          }}
          data-public-page-motion=""
        >
          {children}
        </m.div>

        <AnimatePresence initial={false}>
          {showBackToTop ? (
            <m.div
              key="back-to-top"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 20,
                      scale: 0.82,
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
                      y: 16,
                      scale: 0.88,
                    }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed bottom-24 right-5 sm:bottom-28 sm:right-7 z-50"
            >
              <Button
                type="button"
                size="icon"
                className="size-11 rounded-full shadow-lg"
                aria-label="Kembali ke bagian atas halaman"
                title="Kembali ke atas"
                onClick={handleBackToTop}
              >
                <ArrowUp className="size-5" />
              </Button>
            </m.div>
          ) : null}
        </AnimatePresence>
      </>
    </>
  );
}
