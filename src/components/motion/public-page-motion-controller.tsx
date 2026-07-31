"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type PublicPageMotionControllerProps = {
  pageId: string;
};

/**
 * Controller animasi generik untuk halaman publik.
 *
 * Halaman induk tetap menjadi Server Component. Controller hanya
 * menambahkan perubahan visual setelah hydration sehingga heading,
 * paragraf, tautan, dan structured content tetap tersedia pada HTML.
 */
export function PublicPageMotionController({
  pageId,
}: PublicPageMotionControllerProps) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const rootElement = markerRef.current?.parentElement;

    if (!rootElement || shouldReduceMotion) {
      return;
    }

    const sections = Array.from(
      rootElement.querySelectorAll<HTMLElement>(
        ":scope > section, :scope > div > section",
      ),
    );

    if (sections.length === 0) {
      return;
    }

    const animationControls: ReturnType<typeof animate>[] = [];

    function clearStyles(element: HTMLElement): void {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("will-change");
    }

    function prepareElement(
      element: HTMLElement,
      options: {
        opacity: number;
        distance: number;
        scale: number;
      },
    ): void {
      element.style.opacity = String(options.opacity);
      element.style.transform =
        `translate3d(0, ${options.distance}px, 0) ` + `scale(${options.scale})`;

      element.style.willChange = "transform, opacity";
    }

    function runAnimation(
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

      animationControls.push(control);

      void control.finished
        .then(() => {
          clearStyles(element);
        })
        .catch(() => undefined);
    }

    const heroSection = sections[0];

    const heroItems = heroSection
      ? Array.from(
          heroSection.querySelectorAll<HTMLElement>(
            "h1, p, [data-slot='badge'], [data-slot='button']",
          ),
        )
      : [];

    if (heroSection) {
      prepareElement(heroSection, {
        opacity: 0.45,
        distance: 28,
        scale: 0.992,
      });

      runAnimation(heroSection, {
        duration: 0.8,
      });
    }

    heroItems.forEach((item, index) => {
      prepareElement(item, {
        opacity: 0.12,
        distance: 34,
        scale: 0.98,
      });

      runAnimation(item, {
        delay: 0.08 + index * 0.08,
        duration: 0.68,
      });
    });

    const observedSections = sections.slice(1);

    for (const section of observedSections) {
      prepareElement(section, {
        opacity: 0.62,
        distance: 48,
        scale: 0.992,
      });

      const cards = Array.from(
        section.querySelectorAll<HTMLElement>('[data-slot="card"]'),
      );

      cards.forEach((card) => {
        prepareElement(card, {
          opacity: 0.12,
          distance: 32,
          scale: 0.965,
        });
      });
    }

    function revealSection(section: HTMLElement): void {
      runAnimation(section, {
        duration: 0.8,
      });

      const cards = Array.from(
        section.querySelectorAll<HTMLElement>('[data-slot="card"]'),
      );

      cards.forEach((card, index) => {
        runAnimation(card, {
          delay: 0.08 + index * 0.075,
          duration: 0.64,
        });
      });
    }

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            const section = entry.target as HTMLElement;

            observer?.unobserve(section);
            revealSection(section);
          }
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -7% 0px",
        },
      );

      observedSections.forEach((section) => {
        observer?.observe(section);
      });
    } else {
      observedSections.forEach(revealSection);
    }

    return () => {
      observer?.disconnect();

      animationControls.forEach((control) => {
        control.stop();
      });

      sections.forEach((section) => {
        clearStyles(section);

        section
          .querySelectorAll<HTMLElement>('[data-slot="card"]')
          .forEach(clearStyles);
      });

      heroItems.forEach(clearStyles);
    };
  }, [shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-public-page-motion={pageId}
    />
  );
}
