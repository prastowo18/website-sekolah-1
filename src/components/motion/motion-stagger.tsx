"use client";

import { m, useInView, useReducedMotion } from "motion/react";
import { Children, useRef } from "react";
import type { ReactNode } from "react";

import { useHydrated } from "@/components/motion/use-hydrated";

const defaultEasing = [0.16, 1, 0.3, 1] as const;

type MotionStaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  distance?: number;
  duration?: number;
  hover?: boolean;
  amount?: number;
};

export function MotionStagger({
  children,
  className,
  stagger = 0.1,
  distance = 38,
  duration = 0.72,
  hover = true,
  amount = 0.15,
}: MotionStaggerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(containerRef, {
    once: true,
    amount,
    margin: "0px 0px -7% 0px",
  });

  const isHydrated = useHydrated();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const isVisible = !isHydrated || shouldReduceMotion || isInView;

  return (
    <>
      <>
        <div ref={containerRef} className={className} data-motion-stagger="">
          {Children.map(children, (child, index) => (
            <m.div
              initial={false}
              animate={
                isVisible
                  ? {
                      y: 0,
                      scale: 1,
                    }
                  : {
                      y: distance,
                      scale: 0.95,
                    }
              }
              whileHover={
                hover && !shouldReduceMotion
                  ? {
                      y: -7,
                      scale: 1.015,
                    }
                  : undefined
              }
              whileTap={
                hover && !shouldReduceMotion
                  ? {
                      scale: 0.99,
                    }
                  : undefined
              }
              transition={{
                duration: shouldReduceMotion ? 0 : duration,
                delay:
                  isVisible && isHydrated && !shouldReduceMotion
                    ? index * stagger
                    : 0,
                ease: defaultEasing,
              }}
              style={{ height: "100%" }}
              data-motion-stagger-item=""
            >
              {child}
            </m.div>
          ))}
        </div>
      </>
    </>
  );
}
