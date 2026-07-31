'use client';

import { animate } from 'motion';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

const motionEase = [0.16, 1, 0.3, 1] as const;

type TeacherPageId = 'teacher-list' | 'teacher-detail';

type TeacherPagesMotionControllerProps = {
  pageId: TeacherPageId;
};

type MotionControl = {
  stop: () => void;
};

/**
 * Controller visual untuk halaman guru.
 *
 * Halaman daftar dan detail tetap menjadi Server Component.
 * Konten, heading, tautan, data guru, dan metadata tetap tersedia
 * pada HTML sebelum JavaScript dijalankan.
 */
export function TeacherPagesMotionController({
  pageId,
}: TeacherPagesMotionControllerProps) {
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
      const duration = options?.duration ?? 0.72;

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

      const timeout = window.setTimeout(
        () => {
          clearStyles(element);
        },
        Math.ceil((delay + duration) * 1000) + 180,
      );

      cleanupTimeouts.push(timeout);
    }

    const topLevelBlocks = Array.from(
      rootElement.querySelectorAll<HTMLElement>(
        ':scope > header, :scope > section, :scope > div',
      ),
    );

    if (topLevelBlocks.length === 0) {
      return;
    }

    const heroBlock = topLevelBlocks[0];

    const heroItems = Array.from(
      heroBlock.querySelectorAll<HTMLElement>(
        [
          "[data-slot='badge']",
          "[data-slot='button']",
          'h1',
          'p',
          "[role='img']",
        ].join(', '),
      ),
    ).slice(0, 12);

    heroItems.forEach((element) => {
      const isVisual =
        element.matches("[role='img']") ||
        element.classList.contains('aspect-[4/5]');

      prepareElement(element, {
        opacity: isVisual ? 0.18 : 0.08,
        x: pageId === 'teacher-detail' && isVisual ? -36 : 0,
        y: isVisual ? 16 : 42,
        scale: isVisual ? 0.94 : 0.975,
      });
    });

    const heroAnimationFrame = window.requestAnimationFrame(() => {
      heroItems.forEach((element, index) => {
        revealElement(element, {
          delay: 0.06 + index * 0.075,
          duration: 0.7,
        });
      });
    });

    const revealTargets: HTMLElement[] = [];

    topLevelBlocks.slice(1).forEach((block) => {
      if (block.tagName === 'DIV') {
        const directChildren = Array.from(block.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement &&
            !element.hasAttribute('data-teacher-page-motion'),
        );

        if (directChildren.length > 0) {
          revealTargets.push(...directChildren);
          return;
        }
      }

      revealTargets.push(block);
    });

    revealTargets.forEach((target) => {
      prepareElement(target, {
        opacity: 0.35,
        y: 48,
        scale: 0.988,
      });

      const cards = Array.from(
        target.querySelectorAll<HTMLElement>('[data-slot="card"]'),
      );

      cards.forEach((card) => {
        prepareElement(card, {
          opacity: 0.08,
          y: 38,
          scale: 0.955,
        });
      });
    });

    function revealTarget(target: HTMLElement): void {
      revealElement(target, {
        duration: 0.78,
      });

      const cards = Array.from(
        target.querySelectorAll<HTMLElement>('[data-slot="card"]'),
      );

      cards.forEach((card, index) => {
        revealElement(card, {
          delay: 0.08 + Math.min(index, 8) * 0.07,
          duration: 0.64,
        });
      });

      const images = Array.from(
        target.querySelectorAll<HTMLElement>("[role='img']"),
      );

      images.forEach((image, index) => {
        prepareElement(image, {
          opacity: 0.32,
          y: 18,
          scale: 0.94,
        });

        revealElement(image, {
          delay: 0.12 + Math.min(index, 6) * 0.06,
          duration: 0.68,
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

            const target = entry.target as HTMLElement;

            observer?.unobserve(target);
            revealTarget(target);
          }
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -7% 0px',
        },
      );

      revealTargets.forEach((target) => {
        observer?.observe(target);
      });
    } else {
      revealTargets.forEach(revealTarget);
    }

    return () => {
      observer?.disconnect();

      window.cancelAnimationFrame(heroAnimationFrame);

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimeouts.forEach((timeout) => {
        window.clearTimeout(timeout);
      });

      heroItems.forEach(clearStyles);

      revealTargets.forEach((target) => {
        clearStyles(target);

        target
          .querySelectorAll<HTMLElement>('[data-slot="card"], [role="img"]')
          .forEach(clearStyles);
      });
    };
  }, [pageId, shouldReduceMotion]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-teacher-page-motion={pageId}
    />
  );
}
