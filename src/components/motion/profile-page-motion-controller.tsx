"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type MotionControl = {
  stop: () => void;
};

/**
 * Mengaktifkan animasi halaman profil tanpa mengubah halaman
 * menjadi Client Component.
 *
 * Seluruh konten halaman tetap dirender server dan tersedia pada
 * HTML. Controller hanya menambahkan efek visual setelah hydration.
 */
export function ProfilePageMotionController() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const rootElement = markerRef.current?.parentElement;

    if (!rootElement || shouldReduceMotion) {
      return;
    }

    const sections = Array.from(
      rootElement.querySelectorAll<HTMLElement>(":scope > section"),
    );

    if (sections.length === 0) {
      return;
    }

    const motionControls: MotionControl[] = [];

    function clearInitialStyles(element: HTMLElement): void {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("will-change");
    }

    function prepareElement(
      element: HTMLElement,
      distance: number,
      scale: number,
      opacity: number,
    ): void {
      element.style.opacity = String(opacity);
      element.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
      element.style.willChange = "transform, opacity";
    }

    function animateElement(
      element: HTMLElement,
      options?: {
        delay?: number;
        duration?: number;
      },
    ): void {
      const control = animate(
        element,
        {
          opacity: 1,
          transform: "translate3d(0, 0px, 0) scale(1)",
        },
        {
          duration: options?.duration ?? 0.76,
          delay: options?.delay ?? 0,
          ease: motionEase,
        },
      );

      motionControls.push(control);

      void control.finished
        .then(() => {
          clearInitialStyles(element);
        })
        .catch(() => undefined);
    }

    const heroSection = sections[0];

    const heroContent =
      heroSection?.querySelector<HTMLElement>(
        ":scope > div:not([aria-hidden='true'])",
      ) ?? heroSection;

    if (heroContent) {
      prepareElement(heroContent, 32, 0.985, 0.35);
      animateElement(heroContent, {
        duration: 0.82,
      });
    }

    const observedSections = sections.slice(1);

    for (const section of observedSections) {
      prepareElement(section, 46, 0.988, 0.14);

      const cards = Array.from(
        section.querySelectorAll<HTMLElement>('[data-slot="card"]'),
      );

      for (const card of cards) {
        prepareElement(card, 28, 0.97, 0.16);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const section = entry.target as HTMLElement;

          observer.unobserve(section);

          animateElement(section, {
            duration: 0.8,
          });

          const cards = Array.from(
            section.querySelectorAll<HTMLElement>('[data-slot="card"]'),
          );

          cards.forEach((card, index) => {
            animateElement(card, {
              delay: 0.1 + index * 0.07,
              duration: 0.65,
            });
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    for (const section of observedSections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();

      for (const control of motionControls) {
        control.stop();
      }

      for (const section of sections) {
        clearInitialStyles(section);

        const cards =
          section.querySelectorAll<HTMLElement>('[data-slot="card"]');

        cards.forEach(clearInitialStyles);
      }

      if (heroContent) {
        clearInitialStyles(heroContent);
      }
    };
  }, [shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-profile-motion-controller=""
    />
  );
}
