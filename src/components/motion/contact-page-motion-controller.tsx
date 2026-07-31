"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type MotionControl = {
  stop: () => void;
};

/**
 * Animasi visual khusus halaman kontak.
 *
 * Halaman induk tetap menjadi Server Component. Informasi kontak,
 * formulir pesan, tautan, dan Google Maps tetap tersedia pada HTML.
 */
export function ContactPageMotionController() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const rootElement = markerRef.current?.parentElement;

    if (!rootElement || shouldReduceMotion) {
      return;
    }

    const controls: MotionControl[] = [];
    const cleanupTimeouts: number[] = [];

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

    function revealElement(
      element: HTMLElement,
      options?: {
        delay?: number;
        duration?: number;
      },
    ): void {
      const delay = options?.delay ?? 0;
      const duration = options?.duration ?? 0.7;

      const control = animate(
        element,
        {
          opacity: 1,
          transform: "translate3d(0, 0px, 0) scale(1)",
        },
        {
          duration,
          delay,
          ease: motionEase,
        },
      );

      controls.push(control);

      const timeout = window.setTimeout(
        () => {
          clearStyles(element);
        },
        Math.ceil((delay + duration) * 1000) + 150,
      );

      cleanupTimeouts.push(timeout);
    }

    const heroSection = rootElement.querySelector<HTMLElement>(
      ":scope > section:first-of-type",
    );

    const contentGrid = rootElement.querySelector<HTMLElement>(":scope > div");

    const informationColumn =
      contentGrid?.querySelector<HTMLElement>(":scope > aside") ?? null;

    const formAndMapColumn =
      contentGrid?.querySelector<HTMLElement>(":scope > div") ?? null;

    const heroItems = heroSection
      ? Array.from(
          heroSection.querySelectorAll<HTMLElement>(
            "[data-slot='badge'], h1, p",
          ),
        )
      : [];

    heroItems.forEach((element, index) => {
      prepareElement(element, {
        opacity: 0.08,
        distance: 42,
        scale: 0.975,
      });

      revealElement(element, {
        delay: 0.06 + index * 0.1,
        duration: 0.72,
      });
    });

    const informationItems = informationColumn
      ? Array.from(informationColumn.children).filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        )
      : [];

    const formAndMapItems = formAndMapColumn
      ? Array.from(formAndMapColumn.children).filter(
          (element): element is HTMLElement => element instanceof HTMLElement,
        )
      : [];

    const observedItems = [...informationItems, ...formAndMapItems];

    observedItems.forEach((element) => {
      prepareElement(element, {
        opacity: 0.1,
        distance: 48,
        scale: 0.965,
      });
    });

    function revealObservedItem(element: HTMLElement, index: number): void {
      revealElement(element, {
        delay: Math.min(index * 0.065, 0.26),
        duration: 0.74,
      });
    }

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      const itemIndexes = new Map<HTMLElement, number>();

      observedItems.forEach((element, index) => {
        itemIndexes.set(element, index);
      });

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            const element = entry.target as HTMLElement;
            const index = itemIndexes.get(element) ?? 0;

            observer?.unobserve(element);
            revealObservedItem(element, index);
          }
        },
        {
          threshold: 0.08,
          rootMargin: "0px 0px -7% 0px",
        },
      );

      observedItems.forEach((element) => {
        observer?.observe(element);
      });
    } else {
      observedItems.forEach(revealObservedItem);
    }

    return () => {
      observer?.disconnect();

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimeouts.forEach((timeout) => {
        window.clearTimeout(timeout);
      });

      heroItems.forEach(clearStyles);
      observedItems.forEach(clearStyles);
    };
  }, [shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-contact-page-motion=""
    />
  );
}
