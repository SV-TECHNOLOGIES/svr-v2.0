"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "./SmoothScroll";
import { PointerDepth } from "./PointerDepth";
import { LatticeRoot } from "@/components/three/LatticeRoot";

/** Client-side providers: motion preferences, smooth scroll, pointer depth, and the lattice. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <PointerDepth />
        <LatticeRoot />
        {children}
      </SmoothScroll>
    </MotionConfig>
  );
}
