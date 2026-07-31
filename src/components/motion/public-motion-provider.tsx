"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

type PublicMotionProviderProps = {
  children: ReactNode;
};

/**
 * Provider Motion tunggal untuk seluruh area publik.
 *
 * Fitur DOM Motion dimuat satu kali dan preferensi Reduce Motion
 * diterapkan secara konsisten pada seluruh komponen turunannya.
 */
export function PublicMotionProvider({ children }: PublicMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
