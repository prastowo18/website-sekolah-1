"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { ReactNode } from "react";

import { useHydrated } from "@/components/motion/use-hydrated";

const defaultEasing = [0.16, 1, 0.3, 1] as const;

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0.06,
  distance = 42,
  duration = 0.78,
}: MotionRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(elementRef, {
    once: true,
    amount: 0.25,
    margin: "0px 0px -8% 0px",
  });

  const isHydrated = useHydrated();
  const shouldReduceMotion = Boolean(useReducedMotion());

  /*
   * Pada server dan sebelum hydration, konten selalu terlihat.
   * Setelah browser aktif, elemen di luar viewport dipersiapkan
   * untuk animasi masuk.
   */
  const isVisible = !isHydrated || shouldReduceMotion || isInView;

  return (
    <>
      <>
        <m.div
          ref={elementRef}
          initial={false}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 0.16,
                  y: distance,
                  scale: 0.96,
                }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : duration,
            delay: isVisible && isHydrated && !shouldReduceMotion ? delay : 0,
            ease: defaultEasing,
          }}
          className={className}
          data-motion-reveal=""
        >
          {children}
        </m.div>
      </>
    </>
  );
}
