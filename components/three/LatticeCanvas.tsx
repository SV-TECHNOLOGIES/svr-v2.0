"use client";

/**
 * The single WebGL canvas for the whole site. Loaded lazily (dynamic import)
 * after the hero text has painted, so three.js never blocks LCP.
 */

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import LatticeScene, { CAMERA_FOV, CAMERA_Z } from "./LatticeScene";
import { latticeStore, setLatticeMode } from "@/lib/lattice-store";
import type { QualityPreset } from "@/lib/quality";

interface Props {
  quality: QualityPreset;
  reduced: boolean;
}

/**
 * Drives rendering with `frameloop="demand"`:
 *  - full frame rate while scrolling, moving the cursor, or morphing
 *  - half frame rate while only idling/drifting
 *  - nothing while the tab is hidden
 *  - reduced motion: renders only when something actually changed
 */
function FrameDriver({ reduced }: { reduced: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (reduced) {
        if (latticeStore.dirty) {
          latticeStore.dirty = false;
          invalidate();
        }
        return;
      }
      frame++;
      const active = now - latticeStore.lastActivity < 1500 || latticeStore.settling;
      if (active || frame % 2 === 0) invalidate();
    };
    raf = requestAnimationFrame(loop);
    latticeStore.dirty = true;
    return () => cancelAnimationFrame(raf);
  }, [invalidate, reduced]);
  return null;
}

/** Procedural studio lighting — no HDR download needed. */
function StudioEnvironment({ resolution }: { resolution: number }) {
  return (
    <Environment resolution={resolution} frames={1}>
      <color attach="background" args={["#eef4ff"]} />
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 6, -2]}
        rotation-x={Math.PI / 2}
        scale={[12, 6, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.6}
        color="#93C5FD"
        position={[-7, 1, 1]}
        rotation-y={Math.PI / 2}
        scale={[10, 5, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        color="#ffffff"
        position={[7, -1, 2]}
        rotation-y={-Math.PI / 2}
        scale={[8, 4, 1]}
      />
      <Lightformer form="ring" intensity={2.4} position={[3, 3, 8]} scale={2.5} />
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#1D4ED8"
        position={[0, -6, 0]}
        rotation-x={-Math.PI / 2}
        scale={[12, 12, 1]}
      />
    </Environment>
  );
}

export default function LatticeCanvas({ quality, reduced }: Props) {
  const [dpr, setDpr] = useState(() => Math.min(quality.dpr, window.devicePixelRatio || 1));

  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV, near: 0.1, far: 60 }}
      gl={{
        alpha: true,
        antialias: quality.antialias,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.transmissionResolutionScale = 0.5;
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setLatticeMode("fallback");
        });
      }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Adaptive quality: step resolution down if the frame rate drops. */}
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, Math.round((d - 0.5) * 10) / 10))}
        flipflops={3}
      />
      <StudioEnvironment resolution={quality.envResolution} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 6]} intensity={0.9} />
      <LatticeScene quality={quality} reduced={reduced} />
      <FrameDriver reduced={reduced} />
    </Canvas>
  );
}
