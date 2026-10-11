"use client";

/**
 * Reveals its direct children from depth (translateZ + scale + fade) with a
 * stagger when scrolled into view. One easing curve and 500–700ms timing
 * everywhere. Reduced motion: content is simply visible.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { setupGsap } from "@/lib/gsap";
import { DURATION, GSAP_EASE, STAGGER } from "@/lib/constants";

interface Props {
  children: ReactNode;
  as?: "div" | "ul" | "ol" | "section";
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate the wrapper itself instead of its children. */
  self?: boolean;
  /** ScrollTrigger start position. */
  start?: string;
  id?: string;
}

export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  stagger = STAGGER,
  self,
  start = "top 85%",
  id,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    (window as Window & { __svrReveal?: boolean }).__svrReveal = true;
    if (!document.documentElement.classList.contains("js-motion")) return;
    const gsap = setupGsap();
    const targets = self ? [el] : Array.from(el.children);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 34, z: -140, scale: 0.96, transformPerspective: 900 },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          scale: 1,
          duration: DURATION.slow,
          delay,
          stagger,
          ease: GSAP_EASE,
          clearProps: "transform,visibility",
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay, stagger, self, start]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      id={id}
      className={className}
      data-reveal-self={self ? "" : undefined}
      data-reveal-group={self ? undefined : ""}
    >
      {children}
    </Tag>
  );
}
