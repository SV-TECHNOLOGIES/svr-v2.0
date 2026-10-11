"use client";

/**
 * Parallax depth layers.
 *
 *  <ParallaxLayer speed={0.35} mouse={18}>   far layer (slow)
 *  lattice (WebGL canvas)                     mid layer
 *  section content                            near layer (normal speed)
 *
 * `speed` counter-moves the layer against the scroll (0 = scrolls with the
 * page, 0.5 = half speed). `mouse` shifts the layer with the cursor (px), via
 * the global --mx/--my CSS variables written by <PointerDepth>.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { setupGsap } from "@/lib/gsap";

interface LayerProps {
  children?: ReactNode;
  speed?: number;
  mouse?: number;
  className?: string;
  /** Element whose scroll range drives the parallax (defaults to closest section). */
  range?: "section" | "self";
}

export function ParallaxLayer({
  children,
  speed = 0.3,
  mouse = 0,
  className = "",
  range = "section",
}: LayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || speed === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gsap = setupGsap();
    const trigger = range === "section" ? (el.closest("section, footer") ?? el) : el;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: () => -speed * window.innerHeight * 0.5 },
        {
          y: () => speed * window.innerHeight * 0.5,
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    });
    return () => ctx.revert();
  }, [speed, range]);

  return (
    <div
      ref={ref}
      className={`${mouse ? "mouse-depth" : ""} ${className}`}
      style={mouse ? ({ "--pd": mouse } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

interface Glow {
  x: string;
  y: string;
  size: number;
  color?: string;
}

interface FarLayerProps {
  glows?: Glow[];
  grid?: boolean;
  dark?: boolean;
  children?: ReactNode;
  speed?: number;
  className?: string;
}

/**
 * The far (slowest) layer every section gets: large soft blue glows and a
 * faint blueprint grid. Sits below the WebGL canvas (z-0).
 */
export function FarLayer({
  glows = [],
  grid = true,
  dark = false,
  children,
  speed = 0.35,
  className = "",
}: FarLayerProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      <ParallaxLayer speed={speed} mouse={22} className="absolute inset-[-12%]">
        {grid && <div className={`far-grid absolute inset-0 ${dark ? "far-grid-dark" : ""}`} />}
        {glows.map((g, i) => (
          <div
            key={i}
            className="far-glow absolute"
            style={{
              left: g.x,
              top: g.y,
              width: g.size,
              height: g.size,
              background: `radial-gradient(closest-side, ${g.color ?? "rgb(59 130 246 / 0.16)"}, transparent)`,
            }}
          />
        ))}
      </ParallaxLayer>
      {children}
    </div>
  );
}
