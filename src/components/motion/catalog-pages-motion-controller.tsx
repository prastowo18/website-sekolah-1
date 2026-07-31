"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

type CatalogPagesMotionControllerProps = {
  pageId: string;
};

type MotionControl = {
  stop: () => void;
};

/**
 * Controller Motion untuk halaman katalog publik.
 *
 * Halaman induk tetap menjadi Server Component. Seluruh judul,
 * isi, gambar, link, dan metadata tersedia pada HTML sebelum
 * JavaScript dijalankan.
 */
export function CatalogPagesMotionController({
  pageId,
}: CatalogPagesMotionControllerProps) {
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
      const duration = options?.duration ?? 0.72;

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

      const cleanupTimer = window.setTimeout(
        () => {
          clearStyles(element);
        },
        Math.ceil((delay + duration) * 1000) + 180,
      );

      cleanupTimers.push(cleanupTimer);
    }

    const topLevelBlocks = Array.from(rootElement.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element.tagName !== "SCRIPT" &&
        element.tagName !== "STYLE" &&
        !element.hasAttribute("data-catalog-page-motion"),
    );

    if (topLevelBlocks.length === 0) {
      return;
    }

    const heroBlock =
      topLevelBlocks.find(
        (element) =>
          element.tagName === "HEADER" || element.tagName === "SECTION",
      ) ?? topLevelBlocks[0];

    const heroItems = Array.from(
      heroBlock.querySelectorAll<HTMLElement>(
        [
          "[data-slot='badge']",
          "h1",
          "h2",
          "p",
          "[data-slot='button']",
          "[role='img']",
        ].join(", "),
      ),
    ).slice(0, 14);

    if (heroItems.length === 0) {
      prepareElement(heroBlock, {
        opacity: 0.2,
        y: 36,
        scale: 0.985,
      });

      revealElement(heroBlock, {
        duration: 0.82,
      });
    } else {
      heroItems.forEach((element, index) => {
        const isImage = element.matches("[role='img']");

        prepareElement(element, {
          opacity: isImage ? 0.18 : 0.06,
          x: isImage ? -28 : 0,
          y: isImage ? 18 : 42,
          scale: isImage ? 0.94 : 0.975,
        });

        revealElement(element, {
          delay: 0.05 + Math.min(index, 10) * 0.075,
          duration: isImage ? 0.8 : 0.7,
        });
      });
    }

    const remainingBlocks = topLevelBlocks.filter(
      (element) => element !== heroBlock,
    );

    function getNestedRevealItems(block: HTMLElement): HTMLElement[] {
      const candidates = Array.from(
        block.querySelectorAll<HTMLElement>(
          ['[data-slot="card"]', "article", "[role='img']", "details"].join(
            ", ",
          ),
        ),
      );

      return candidates.filter((element, index) => {
        if (index > 15) {
          return false;
        }

        return !candidates.some(
          (otherElement) =>
            otherElement !== element &&
            otherElement.contains(element) &&
            otherElement.matches('[data-slot="card"], article, details'),
        );
      });
    }

    remainingBlocks.forEach((block) => {
      prepareElement(block, {
        opacity: 0.3,
        y: 50,
        scale: 0.988,
      });

      getNestedRevealItems(block).forEach((item) => {
        prepareElement(item, {
          opacity: 0.08,
          y: 36,
          scale: 0.955,
        });
      });
    });

    function revealBlock(block: HTMLElement): void {
      revealElement(block, {
        duration: 0.8,
      });

      getNestedRevealItems(block).forEach((item, itemIndex) => {
        revealElement(item, {
          delay: 0.08 + Math.min(itemIndex, 10) * 0.065,
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

            const block = entry.target as HTMLElement;

            observer?.unobserve(block);
            revealBlock(block);
          }
        },
        {
          threshold: 0.07,
          rootMargin: "0px 0px -7% 0px",
        },
      );

      remainingBlocks.forEach((block) => {
        observer?.observe(block);
      });
    } else {
      remainingBlocks.forEach(revealBlock);
    }

    return () => {
      observer?.disconnect();

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      clearStyles(heroBlock);
      heroItems.forEach(clearStyles);

      remainingBlocks.forEach((block) => {
        clearStyles(block);
        getNestedRevealItems(block).forEach(clearStyles);
      });
    };
  }, [pageId, shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-catalog-page-motion={pageId}
    />
  );
}
