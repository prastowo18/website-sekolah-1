'use client';

import { animate } from 'motion';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

const motionEase = [0.16, 1, 0.3, 1] as const;

type InformationPagesMotionControllerProps = {
  pageId: string;
};

type MotionControl = {
  stop: () => void;
};

/**
 * Controller animasi halaman informasi publik.
 *
 * Halaman induk tetap berupa Server Component. Berita, pengumuman,
 * galeri, dokumen, heading, tautan, dan metadata tetap tersedia
 * pada HTML sebelum JavaScript dijalankan.
 */
export function InformationPagesMotionController({
  pageId,
}: InformationPagesMotionControllerProps) {
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
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
      element.style.removeProperty('will-change');
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

      element.style.willChange = 'transform, opacity';
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
          transform: 'translate3d(0px, 0px, 0) scale(1)',
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
        element.tagName !== 'SCRIPT' &&
        element.tagName !== 'STYLE' &&
        !element.hasAttribute('data-information-page-motion'),
    );

    if (topLevelBlocks.length === 0) {
      return;
    }

    const heroBlock =
      topLevelBlocks.find(
        (element) =>
          element.tagName === 'HEADER' || element.tagName === 'SECTION',
      ) ?? topLevelBlocks[0];

    const heroItems = Array.from(
      heroBlock.querySelectorAll<HTMLElement>(
        [
          "[data-slot='badge']",
          'h1',
          'h2',
          'p',
          "[data-slot='button']",
          "[role='img']",
        ].join(', '),
      ),
    ).slice(0, 14);

    heroItems.forEach((element) => {
      const isImage = element.matches("[role='img']");

      prepareElement(element, {
        opacity: isImage ? 0.18 : 0.06,
        x: isImage ? -30 : 0,
        y: isImage ? 18 : 42,
        scale: isImage ? 0.94 : 0.975,
      });
    });

    const heroFrame = window.requestAnimationFrame(() => {
      heroItems.forEach((element, index) => {
        const isImage = element.matches("[role='img']");

        revealElement(element, {
          delay: 0.05 + Math.min(index, 10) * 0.075,
          duration: isImage ? 0.82 : 0.7,
        });
      });
    });

    if (heroItems.length === 0) {
      prepareElement(heroBlock, {
        opacity: 0.24,
        y: 38,
        scale: 0.986,
      });

      revealElement(heroBlock, {
        duration: 0.82,
      });
    }

    const contentBlocks = topLevelBlocks.filter(
      (element) => element !== heroBlock,
    );

    function getNestedItems(block: HTMLElement): HTMLElement[] {
      const candidates = Array.from(
        block.querySelectorAll<HTMLElement>(
          [
            '[data-slot="card"]',
            'article',
            'details',
            "[role='img']",
            'iframe',
            'li',
          ].join(', '),
        ),
      ).slice(0, 24);

      return candidates.filter((element) => {
        return !candidates.some(
          (possibleParent) =>
            possibleParent !== element &&
            possibleParent.contains(element) &&
            possibleParent.matches('[data-slot="card"], article, details'),
        );
      });
    }

    contentBlocks.forEach((block) => {
      prepareElement(block, {
        opacity: 0.3,
        y: 50,
        scale: 0.988,
      });

      getNestedItems(block).forEach((item) => {
        const isMedia =
          item.matches("[role='img']") || item.tagName === 'IFRAME';

        prepareElement(item, {
          opacity: isMedia ? 0.16 : 0.07,
          y: isMedia ? 24 : 36,
          scale: isMedia ? 0.94 : 0.958,
        });
      });
    });

    function revealBlock(block: HTMLElement): void {
      revealElement(block, {
        duration: 0.8,
      });

      getNestedItems(block).forEach((item, itemIndex) => {
        revealElement(item, {
          delay: 0.08 + Math.min(itemIndex, 10) * 0.065,
          duration: 0.64,
        });
      });
    }

    let observer: IntersectionObserver | null = null;

    if ('IntersectionObserver' in window) {
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
          rootMargin: '0px 0px -7% 0px',
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
      window.cancelAnimationFrame(heroFrame);

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      clearStyles(heroBlock);
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
      data-information-page-motion={pageId}
    />
  );
}
