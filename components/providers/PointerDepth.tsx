"use client";

/**
 * Global pointer tracker for mouse parallax.
 * Writes damped `--mx` / `--my` (-1…1) CSS variables on <html> — every
 * parallax layer and glass panel reads them in CSS, so no per-element JS —
 * and feeds the raw pointer to the lattice store for the 3D scene.
 */

import { useEffect } from "react";
import { latticeStore, touchLattice } from "@/lib/lattice-store";

export function PointerDepth() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    let tx = 0,
      ty = 0,
      x = 0,
      y = 0;
    let raf = 0;

    const step = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      root.style.setProperty("--mx", x.toFixed(4));
      root.style.setProperty("--my", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(step) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      latticeStore.pointer.x = nx;
      latticeStore.pointer.y = ny;
      latticeStore.pointer.active = true;
      touchLattice();
      if (reduced.matches) return;
      tx = nx;
      ty = -ny; // CSS y grows downward
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onLeave = () => {
      latticeStore.pointer.active = false;
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(step);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
