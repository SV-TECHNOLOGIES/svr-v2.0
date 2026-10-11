"use client";

/**
 * Mounts the fixed, full-screen lattice layer behind all content.
 *
 * 1. Detects WebGL + device quality.
 * 2. Waits until the browser is idle after first paint (so the hero text and
 *    LCP are never blocked), then lazy-loads three.js and the scene.
 * 3. Falls back to a layered SVG lattice when WebGL is unavailable.
 */

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LatticeDirector } from "./LatticeDirector";
import { LatticeFallback } from "./LatticeFallback";
import { detectQuality, type QualityPreset } from "@/lib/quality";
import { latticeStore, setLatticeMode, subscribeLattice } from "@/lib/lattice-store";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const LatticeCanvas = dynamic(() => import("./LatticeCanvas"), { ssr: false });

const LAYER_ID = "lattice-layer";

export function useLatticeState() {
  return useSyncExternalStore(
    subscribeLattice,
    () => `${latticeStore.mode}:${latticeStore.ready ? 1 : 0}`,
    () => "pending:0",
  );
}

function whenIdle(cb: () => void, timeout: number) {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout });
  else window.setTimeout(cb, 200);
}

export function LatticeRoot() {
  const reduced = usePrefersReducedMotion();
  const [quality, setQuality] = useState<QualityPreset | null>(null);
  const [load, setLoad] = useState(false);
  const [mode, ready] = useLatticeState().split(":");

  useEffect(() => {
    latticeStore.reducedMotion = reduced;
  }, [reduced]);

  useEffect(() => {
    const { webgl, preset } = detectQuality();
    if (!webgl) {
      setLatticeMode("fallback");
      return;
    }
    // Device detection can only run in the browser, so this state is set once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuality(preset);
    setLatticeMode("webgl");

    let cancelled = false;
    const start = () => !cancelled && setLoad(true);
    // Phones/tablets wait a little longer so the main thread stays free for
    // first interaction; desktops start as soon as the page is idle.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const begin = () => whenIdle(start, coarse ? 1800 : 900);
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", begin);
    };
  }, []);

  return (
    <>
      <LatticeDirector reduced={reduced} layerId={LAYER_ID} />
      <div
        id={LAYER_ID}
        aria-hidden="true"
        className="lattice-layer pointer-events-none fixed inset-0 z-[1]"
        data-ready={ready === "1" ? "" : undefined}
      >
        {mode === "webgl" && load && quality && (
          <LatticeCanvas quality={quality} reduced={reduced} />
        )}
        {mode === "fallback" && <LatticeFallback reduced={reduced} />}
      </div>
    </>
  );
}
