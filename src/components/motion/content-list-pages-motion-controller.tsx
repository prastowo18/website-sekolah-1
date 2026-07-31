"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type ContentPageId = "faq" | "testimonial";

type ContentListPagesMotionControllerProps = {
  pageId: ContentPageId;
};

type MotionControl = {
  stop: () => void;
};

/**
 * Controller animasi untuk halaman FAQ dan testimoni.
 *
 * Halaman induk tetap menjadi Server Component. Heading, formulir
 * pencarian, daftar konten, tautan, dan structured data tetap
 * tersedia pada HTML sebelum JavaScript dijalankan.
 */
export function ContentListPagesMotionController({
  pageId,
}: ContentListPagesMotionControllerProps) {
  const markerRef = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const rootElement = markerRef.current?.parentElement;

    if (!rootElement || shouldReduceMotion) {
      return;
    }

    const controls: MotionControl[] = [];
    const cleanupTimers: number[] = [];

    function clearStyles(element: HTMLElement): void {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("will-change");
    }

    function prepareElement(
      element: HTMLElement,
      options: {
        opacity: number;
        x?: number;
        y?: number;
        scale?: number;
      },
    ): void {
      const x = options.x ?? 0;
      const y = options.y ?? 0;
      const scale = options.scale ?? 1;

      element.style.opacity = String(options.opacity);
      element.style.transform =
        `translate3d(${x}px, ${y}px, 0) ` + `scale(${scale})`;

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
          transform: "translate3d(0px, 0px, 0) scale(1)",
        },
        {
          duration,
          delay,
          ease: motionEase,
        },
      );

      controls.push(control);

      const timer = window.setTimeout(
        () => {
          clearStyles(element);
        },
        Math.ceil((delay + duration) * 1000) + 180,
      );

      cleanupTimers.push(timer);
    }

    const heroSection =
      rootElement.querySelector<HTMLElement>(":scope > section");

    const contentContainer = Array.from(rootElement.children).find(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element.tagName === "DIV" &&
        !element.hasAttribute("data-content-list-page-motion"),
    );

    const heroItems = heroSection
      ? Array.from(
          heroSection.querySelectorAll<HTMLElement>(
            "[data-slot='badge'], h1, p",
          ),
        ).slice(0, 8)
      : [];

    heroItems.forEach((element, index) => {
      prepareElement(element, {
        opacity: 0.08,
        y: 42,
        scale: 0.975,
      });

      revealElement(element, {
        delay: 0.06 + index * 0.1,
        duration: 0.72,
      });
    });

    if (!contentContainer) {
      return;
    }

    const contentBlocks = Array.from(contentContainer.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );

    function getNestedItems(block: HTMLElement): HTMLElement[] {
      const selector =
        pageId === "faq" ? '[data-slot="card"], details' : '[data-slot="card"]';

      const nested = Array.from(block.querySelectorAll<HTMLElement>(selector));

      return Array.from(new Set(nested.filter((element) => element !== block)));
    }

    contentBlocks.forEach((block) => {
      prepareElement(block, {
        opacity: 0.28,
        y: 48,
        scale: 0.988,
      });

      getNestedItems(block).forEach((item) => {
        prepareElement(item, {
          opacity: 0.08,
          y: 34,
          scale: 0.96,
        });
      });
    });

    function revealBlock(block: HTMLElement): void {
      revealElement(block, {
        duration: 0.78,
      });

      const nestedItems = getNestedItems(block);

      nestedItems.forEach((item, index) => {
        revealElement(item, {
          delay: 0.08 + Math.min(index, 10) * 0.065,
          duration: 0.62,
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

            const block = entry.target as HTMLElement;

            observer?.unobserve(block);
            revealBlock(block);
          }
        },
        {
          threshold: 0.07,
          rootMargin: "0px 0px -6% 0px",
        },
      );

      contentBlocks.forEach((block) => {
        observer?.observe(block);
      });
    } else {
      contentBlocks.forEach(revealBlock);
    }

    return () => {
      observer?.disconnect();

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      heroItems.forEach(clearStyles);

      contentBlocks.forEach((block) => {
        clearStyles(block);
        getNestedItems(block).forEach(clearStyles);
      });
    };
  }, [pageId, shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-content-list-page-motion={pageId}
    />
  );
}
