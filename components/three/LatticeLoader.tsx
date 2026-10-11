"use client";

/**
 * Minimal branded loader shown where the hero lattice will appear:
 * logo mark + a thin blue progress line. Never covers the hero text,
 * and always disappears within ~1.5s (the lattice fades in when ready).
 */

import { useEffect, useState } from "react";
import { useLatticeState } from "./LatticeRoot";
import { LogoMark } from "@/components/ui/Logo";

export function LatticeLoader() {
  const [mode, ready] = useLatticeState().split(":");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setTimedOut(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  const hidden = ready === "1" || timedOut || mode === "fallback";

  return (
    <div
      aria-hidden="true"
      className="lattice-loader pointer-events-none absolute inset-0 flex items-center justify-center"
      data-hidden={hidden ? "" : undefined}
    >
      <div className="flex w-36 flex-col items-center gap-4">
        <LogoMark className="h-10 w-10 opacity-80" />
        <div className="bg-primary/10 h-[2px] w-full overflow-hidden rounded-full">
          <div className="lattice-loader-bar from-primary via-accent to-glow h-full rounded-full bg-gradient-to-r" />
        </div>
      </div>
    </div>
  );
}
