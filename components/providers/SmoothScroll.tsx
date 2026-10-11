"use client";

/**
 * Lenis smooth scrolling, synced with GSAP ScrollTrigger through the GSAP
 * ticker (one rAF loop drives both). Disabled for reduced motion, where the
 * browser's native scrolling is used instead.
 */

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { setupGsap, ScrollTrigger } from "@/lib/gsap";
import { NAV_OFFSET } from "@/lib/constants";
import { touchLattice } from "@/lib/lattice-store";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type ScrollTarget = string | HTMLElement | number;
interface ScrollApi {
  scrollTo: (
    target: ScrollTarget,
    opts?: { offset?: number; immediate?: boolean; onComplete?: () => void },
  ) => void;
  stop: () => void;
  start: () => void;
}

const ScrollContext = createContext<ScrollApi | null>(null);

export function useSmoothScroll(): ScrollApi {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useSmoothScroll must be used inside <SmoothScroll>");
  return ctx;
}

/** Sections that pin (sticky) should be entered at their very top, not under the nav. */
function offsetFor(el: HTMLElement | null) {
  return el?.dataset.scrollOffset !== undefined ? Number(el.dataset.scrollOffset) : -NAV_OFFSET;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const gsap = setupGsap();
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, anchors: false });
    lenisRef.current = lenis;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      touchLattice();
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  // Re-measure every trigger once web fonts have settled (text reflow).
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const scrollTo = useCallback<ScrollApi["scrollTo"]>((target, opts = {}) => {
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : typeof target === "number"
          ? null
          : target;
    const offset = opts.offset ?? offsetFor(el);
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(el ?? (target as number), {
        offset,
        duration: 1.4,
        immediate: opts.immediate,
        onComplete: opts.onComplete,
      });
    } else {
      const y = el ? el.getBoundingClientRect().top + window.scrollY + offset : (target as number);
      window.scrollTo({ top: y, behavior: "auto" });
      opts.onComplete?.();
    }
    // Move keyboard focus to the target for accessibility.
    if (el && typeof target === "string") {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    }
  }, []);

  const api: ScrollApi = {
    scrollTo,
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
