"use client";

import {
  domAnimation,
  LazyMotion,
  m,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import type { ReactNode } from "react";

const defaultEasing = [0.16, 1, 0.3, 1] as const;

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
};

/**
 * Animasi masuk yang cukup terlihat tetapi tetap profesional.
 *
 * Konten tetap berada di HTML hasil render server. Komponen ini hanya
 * memberikan perubahan visual berupa opacity, translate, dan scale.
 */
export function MotionReveal({
  children,
  className,
  delay = 0.06,
  distance = 42,
  duration = 0.78,
}: MotionRevealProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0.18,
                  y: distance,
                  scale: 0.96,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.28,
            margin: "0px 0px -10% 0px",
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : duration,
            delay: shouldReduceMotion ? 0 : delay,
            ease: defaultEasing,
          }}
          style={{
            willChange: shouldReduceMotion ? undefined : "transform, opacity",
          }}
          className={className}
          data-motion-reveal=""
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
