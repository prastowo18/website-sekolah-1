"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type PublicFooterMotionProps = {
  children: ReactNode;
};

/**
 * Pembungkus visual untuk footer publik.
 *
 * Isi footer tetap berasal dari Server Component dan tetap tersedia
 * pada HTML. Motion hanya memberikan efek transformasi.
 */
export function PublicFooterMotion({ children }: PublicFooterMotionProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <>
      <>
        <m.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 1,
                  y: 56,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.08,
            margin: "0px 0px -2% 0px",
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.82,
            ease: motionEase,
          }}
          className="relative isolate overflow-hidden"
          data-public-footer-motion=""
        >
          {!shouldReduceMotion ? (
            <m.div
              aria-hidden="true"
              initial={{
                opacity: 1,
                scaleX: 0,
              }}
              whileInView={{
                opacity: 1,
                scaleX: 1,
              }}
              viewport={{
                once: true,
                amount: 0.1,
              }}
              transition={{
                duration: 0.9,
                delay: 0.12,
                ease: motionEase,
              }}
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1 origin-center bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          ) : null}

          {children}
        </m.div>
      </>
    </>
  );
}
