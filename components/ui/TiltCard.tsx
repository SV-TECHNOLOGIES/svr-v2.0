"use client";

/**
 * Card with physical depth: perspective tilt following the cursor, a moving
 * light glare, and layered blue-tinted shadows. Children can use the
 * `.depth-1/2/3` classes to float at different Z depths inside the card.
 */

import { useRef, type PointerEvent, type ReactNode } from "react";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/use-reduced-motion";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  as?: "div" | "article" | "li";
  glare?: boolean;
}

export function TiltCard({
  children,
  className = "",
  max = 7,
  as: Tag = "div",
  glare = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const raf = useRef(0);

  const onMove = (e: PointerEvent) => {
    if (!fine || reduced) return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.dataset.tilting = "";
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilting;
  };

  return (
    <Tag
      ref={ref as React.Ref<never>}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-card ${className}`}
    >
      {glare && <span className="tilt-glare" aria-hidden />}
      {children}
    </Tag>
  );
}
