"use client";

import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const motionEase = [0.16, 1, 0.3, 1] as const;

export type StatusPageMotionVariant = "loading" | "not-found";

type StatusPageMotionControllerProps = {
  variant: StatusPageMotionVariant;
};

type MotionControl = {
  stop: () => void;
};

export function StatusPageMotionController({
  variant,
}: StatusPageMotionControllerProps) {
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
        y: number;
        scale: number;
      },
    ): void {
      element.style.opacity = String(options.opacity);

      element.style.transform =
        `translate3d(0, ${options.y}px, 0) ` + `scale(${options.scale})`;

      element.style.willChange = "opacity, transform";
    }

    function revealElement(
      element: HTMLElement,
      options: {
        delay: number;
        duration: number;
      },
    ): void {
      const control = animate(
        element,
        {
          opacity: 1,
          transform: "translate3d(0, 0px, 0) scale(1)",
        },
        {
          delay: options.delay,
          duration: options.duration,
          ease: motionEase,
        },
      );

      controls.push(control);

      const cleanupTimer = window.setTimeout(
        () => {
          clearStyles(element);
        },
        Math.ceil((options.delay + options.duration) * 1000) + 180,
      );

      cleanupTimers.push(cleanupTimer);
    }

    let targets: HTMLElement[] = [];

    if (variant === "loading") {
      const skeletonTargets = Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          [
            '[data-slot="skeleton"]',
            ".animate-pulse",
            '[data-slot="card"]',
          ].join(", "),
        ),
      );

      targets = Array.from(new Set(skeletonTargets)).slice(0, 40);
    } else {
      const contentTargets = Array.from(
        rootElement.querySelectorAll<HTMLElement>(
          ["h1", "h2", "p", '[data-slot="button"]', "a"].join(", "),
        ),
      );

      const firstVisual = rootElement.querySelector<HTMLElement>(
        [
          ":scope > div > div:first-child",
          ":scope > section > div > div:first-child",
        ].join(", "),
      );

      targets = Array.from(
        new Set(
          firstVisual ? [firstVisual, ...contentTargets] : contentTargets,
        ),
      ).slice(0, 18);
    }

    if (targets.length === 0) {
      const fallbackTarget = rootElement.querySelector<HTMLElement>(
        ":scope > div, :scope > section",
      );

      if (fallbackTarget) {
        targets = [fallbackTarget];
      }
    }

    if (targets.length === 0) {
      return;
    }

    targets.forEach((element, index) => {
      prepareElement(element, {
        opacity: variant === "loading" ? 0.2 : 0.08,

        y: variant === "loading" ? 14 : index === 0 ? 24 : 40,

        scale: variant === "loading" ? 0.985 : index === 0 ? 0.9 : 0.975,
      });
    });

    const animationFrame = window.requestAnimationFrame(() => {
      targets.forEach((element, index) => {
        revealElement(element, {
          delay:
            variant === "loading"
              ? Math.min(index, 12) * 0.035
              : 0.05 + Math.min(index, 10) * 0.085,

          duration: variant === "loading" ? 0.48 : 0.7,
        });
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);

      controls.forEach((control) => {
        control.stop();
      });

      cleanupTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });

      targets.forEach(clearStyles);
    };
  }, [shouldReduceMotion, variant]);

  return (
    <span
      ref={markerRef}
      hidden
      aria-hidden="true"
      data-status-page-motion={variant}
    />
  );
}
