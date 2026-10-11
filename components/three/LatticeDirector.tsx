"use client";

/**
 * Maps scroll position → lattice stage.
 *
 * Sections declare their stage in HTML:
 *   data-lattice-stage="6"     stage 6 is reached when the section is centred
 *   data-lattice-stage="1-5"   sticky section: stages 1→5 across its scroll range
 *   data-lattice-still="5"     stage to show in reduced-motion (no sticky)
 *
 * Between anchors the stage is interpolated linearly, so the lattice morphs
 * continuously. With reduced motion the stage snaps to the nearest section
 * and the canvas cross-fades instead of morphing.
 */

import { useEffect } from "react";
import { latticeStore, touchLattice } from "@/lib/lattice-store";
import { setupGsap, ScrollTrigger } from "@/lib/gsap";

interface Anchor {
  y: number;
  stage: number;
}

export function LatticeDirector({ reduced, layerId }: { reduced: boolean; layerId: string }) {
  useEffect(() => {
    setupGsap();
    let anchors: Anchor[] = [];
    let fadeTimer = 0;
    let pendingStage = -1;

    const measure = () => {
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const pts: Anchor[] = [];
      document.querySelectorAll<HTMLElement>("[data-lattice-stage]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        const raw = el.dataset.latticeStage ?? "0";
        if (raw.includes("-") && !reduced) {
          const [s0, s1] = raw.split("-").map(Number);
          const range = Math.max(1, r.height - vh);
          pts.push({ y: top + range * 0.1, stage: s0 }, { y: top + range * 0.9, stage: s1 });
        } else {
          const still = el.dataset.latticeStill;
          const stage = reduced && still !== undefined ? Number(still) : Number(raw.split("-")[0]);
          pts.push({ y: top + r.height / 2 - vh / 2, stage });
        }
      });
      pts.sort((a, b) => a.stage - b.stage);
      pts.forEach((p) => (p.y = Math.min(Math.max(p.y, 0), max)));
      // Keep anchors strictly increasing so every stage is reachable,
      // even when the last sections are shorter than the viewport.
      for (let i = pts.length - 2; i >= 0; i--) {
        if (pts[i].y > pts[i + 1].y - 60) pts[i].y = pts[i + 1].y - 60;
      }
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].y <= pts[i - 1].y) pts[i].y = pts[i - 1].y + 1;
      }
      anchors = pts;
      update();
    };

    const stageAt = (y: number) => {
      if (!anchors.length) return 0;
      if (reduced) {
        let best = anchors[0];
        for (const a of anchors) if (Math.abs(a.y - y) < Math.abs(best.y - y)) best = a;
        return best.stage;
      }
      if (y <= anchors[0].y) return anchors[0].stage;
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i];
        const b = anchors[i + 1];
        if (y <= b.y) return a.stage + ((y - a.y) / (b.y - a.y)) * (b.stage - a.stage);
      }
      return anchors[anchors.length - 1].stage;
    };

    const layer = () => document.getElementById(layerId);

    const update = () => {
      const stage = stageAt(window.scrollY);
      if (!reduced) {
        if (stage !== latticeStore.stage) {
          latticeStore.stage = stage;
          touchLattice();
        }
        return;
      }
      // Reduced motion: no morph — fade out, swap layout, fade in.
      touchLattice();
      if (stage === latticeStore.stage || stage === pendingStage) return;
      pendingStage = stage;
      const el = layer();
      if (el) el.style.opacity = "0";
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => {
        latticeStore.stage = stage;
        pendingStage = -1;
        touchLattice();
        if (el) el.style.opacity = "";
      }, 320);
    };

    let raf = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    ScrollTrigger.addEventListener("refresh", scheduleMeasure);
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", scheduleMeasure);
      ScrollTrigger.removeEventListener("refresh", scheduleMeasure);
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
    };
  }, [reduced, layerId]);

  return null;
}
