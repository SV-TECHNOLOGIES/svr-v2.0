"use client";
/* eslint-disable react-hooks/immutability -- three.js geometries, materials, and the simulation buffers are
   intentionally mutated in useFrame every frame (standard React Three Fiber pattern; no React state involved). */

/**
 * The Build Lattice scene: one instanced mesh of glass nodes, one instanced
 * mesh of glowing connection lines, and one point cloud of soft halos.
 *
 * Every frame:
 *  1. read the scroll-driven stage from the lattice store
 *  2. resolve the DOM anchors of the two adjacent states
 *  3. blend every node between the two layouts (staggered per node)
 *  4. add drift, cursor repulsion, and the QA scan pulse
 *  5. write instance matrices + line endpoints
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { buildLattice, EDGE_SET, type GroupSpec, type StateParams } from "./lattice-states";
import {
  createEdgeGeometry,
  createEdgeMaterial,
  createHaloGeometry,
  createHaloMaterial,
  createNodeMaterial,
  NODE_TINTS,
} from "./materials";
import { latticeStore, setLatticeReady } from "@/lib/lattice-store";
import { getAnchorRect } from "@/lib/anchors";
import { clamp, damp, lerp, smoother } from "@/lib/random";
import { STAGE } from "@/lib/constants";
import type { QualityPreset } from "@/lib/quality";

export const CAMERA_Z = 10;
export const CAMERA_FOV = 35;
const TAN_HALF_FOV = Math.tan(((CAMERA_FOV / 2) * Math.PI) / 180);
/** Base glass node radius in world units. */
const NODE_RADIUS = 0.1;

/** Resolved world transform for one group in the current frame. */
interface GroupXf {
  cx: number;
  cy: number;
  cz: number;
  sx: number;
  sy: number;
  sz: number;
  hh: number;
  cX: number;
  sX: number;
  cY: number;
  sY: number;
  cZ: number;
  sZ: number;
}

const newXf = (): GroupXf => ({
  cx: 0,
  cy: 0,
  cz: 0,
  sx: 1,
  sy: 1,
  sz: 1,
  hh: 1,
  cX: 1,
  sX: 0,
  cY: 1,
  sY: 0,
  cZ: 1,
  sZ: 0,
});

const PARAM_KEYS: (keyof StateParams)[] = [
  "nodeScale",
  "drift",
  "pointer",
  "flow",
  "scan",
  "halo",
  "line",
  "night",
];

interface Props {
  quality: QualityPreset;
  reduced: boolean;
}

export default function LatticeScene({ quality, reduced }: Props) {
  const model = useMemo(() => buildLattice(quality.grid), [quality.grid]);
  const N = model.count;
  const E = model.edgeCount;
  const last = model.states.length - 1;

  const sphere = useMemo(() => new THREE.IcosahedronGeometry(1, quality.detail), [quality.detail]);
  const nodeMaterial = useMemo(() => createNodeMaterial(quality), [quality]);
  const edgeGeometry = useMemo(() => createEdgeGeometry(E, model.edgeSeed), [E, model]);
  const edgeMaterial = useMemo(() => createEdgeMaterial(quality), [quality]);
  const haloGeometry = useMemo(() => createHaloGeometry(N), [N]);
  const haloMaterial = useMemo(() => createHaloMaterial(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { camera, size, gl } = useThree();

  /** Mutable simulation state (never triggers React renders). */
  const sim = useMemo(
    () => ({
      cur: new Float32Array(N * 3),
      push: new Float32Array(N * 3),
      scl: new Float32Array(N),
      xfA: Array.from({ length: 6 }, newXf),
      xfB: Array.from({ length: 6 }, newXf),
      params: Object.fromEntries(PARAM_KEYS.map((k) => [k, 0])) as unknown as StateParams,
      init: false,
      readySent: false,
      time: 0,
      stage: 0,
      success: 0,
      camX: 0,
      camY: 0,
      rects: new Map<string, DOMRect | null>(),
    }),
    [N],
  );

  // Instance tints (subtle variation between brand blues).
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const tints = (quality.transmission ? NODE_TINTS.glass : NODE_TINTS.solid).map(
      (c) => new THREE.Color(c),
    );
    for (let i = 0; i < N; i++) mesh.setColorAt(i, tints[model.tint[i]]);
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [model, N, quality.transmission]);

  useEffect(
    () => () => {
      sphere.dispose();
      nodeMaterial.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
    },
    [sphere, nodeMaterial, edgeGeometry, edgeMaterial, haloGeometry, haloMaterial],
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 1 / 20);
    const now = performance.now();
    const W = size.width;
    const H = size.height;
    const viewH = 2 * CAMERA_Z * TAN_HALF_FOV;
    const viewW = viewH * (W / H);
    const dpr = gl.getPixelRatio();

    if (!reduced) sim.time += dt;
    const t = sim.time;
    const snap = reduced || !sim.init;

    // ── stage ──
    const targetStage = clamp(latticeStore.stage, 0, last);
    sim.stage = snap ? targetStage : sim.stage + (targetStage - sim.stage) * damp(7, dt);
    const s = sim.stage;
    const ia = Math.min(Math.floor(s), last);
    const ib = Math.min(ia + 1, last);
    const f = s - ia;
    const fe = smoother(f);
    const A = model.states[ia];
    const B = model.states[ib];

    sim.success = snap
      ? latticeStore.contactSuccess
      : sim.success + (latticeStore.contactSuccess - sim.success) * damp(2.4, dt);

    // ── blended params ──
    const P = sim.params;
    for (const k of PARAM_KEYS) P[k] = lerp(A.params[k], B.params[k], fe);
    if (reduced) {
      P.drift = 0;
      P.pointer = 0;
    }

    // ── camera: gentle mouse parallax (mid layer moves against the content) ──
    const ptr = latticeStore.pointer;
    if (!reduced) {
      const k = damp(2.5, dt);
      sim.camX += ((ptr.active ? ptr.x * 0.35 : 0) - sim.camX) * k;
      sim.camY += ((ptr.active ? ptr.y * 0.22 : 0) - sim.camY) * k;
    }
    camera.position.set(sim.camX, sim.camY, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    // ── resolve DOM anchors → world transforms ──
    sim.rects.clear();
    const rectFor = (id: string) => {
      if (!sim.rects.has(id)) sim.rects.set(id, getAnchorRect(id, now));
      return sim.rects.get(id) ?? null;
    };
    const resolve = (groups: GroupSpec[], out: GroupXf[]) => {
      groups.forEach((g, gi) => {
        const r = rectFor(g.anchor);
        const o = out[gi];
        let cx: number, cy: number, hw: number, hh: number;
        if (r) {
          cx = ((r.left + r.width / 2) / W - 0.5) * viewW;
          cy = -((r.top + r.height / 2) / H - 0.5) * viewH;
          hw = ((r.width / W) * viewW) / 2;
          hh = ((r.height / H) * viewH) / 2;
        } else {
          cx = viewW * 0.22;
          cy = 0;
          hw = viewW * 0.22;
          hh = viewH * 0.32;
        }
        if (!reduced) cy *= g.parallax;
        if (g.fit === "stretch") {
          o.sx = hw * g.size;
          o.sy = hh * g.size;
          o.sz = Math.min(hw, hh) * g.size * 0.6;
        } else {
          o.sx = o.sy = o.sz = Math.min(hw, hh) * g.size;
        }
        o.cx = cx;
        o.cy = cy + g.lift * hh;
        o.cz = g.z;
        o.hh = hh * g.size;
        const ry = g.rot[1] + t * g.spin + Math.sin(t * 0.45 + gi * 1.7) * g.wobble;
        o.cX = Math.cos(g.rot[0]);
        o.sX = Math.sin(g.rot[0]);
        o.cY = Math.cos(ry);
        o.sY = Math.sin(ry);
        o.cZ = Math.cos(g.rot[2]);
        o.sZ = Math.sin(g.rot[2]);
      });
    };
    resolve(A.groups, sim.xfA);
    resolve(B.groups, sim.xfB);

    // QA scan line position (world Y), swept over the process structure.
    const qaXf = ia === STAGE.qa ? sim.xfA[0] : ib === STAGE.qa ? sim.xfB[0] : null;
    const scanY = qaXf ? qaXf.cy + Math.sin(t * 1.25) * qaXf.hh * 0.95 : 0;

    const pointerX = ptr.x * (viewW / 2) + sim.camX;
    const pointerY = ptr.y * (viewH / 2) + sim.camY;
    const pointerOn = ptr.active && P.pointer > 0.01;

    // Contact stage blends towards its fully-assembled variant on success.
    const C = model.contactAssembled;
    const succ = sim.success;

    const kPos = damp(5, dt);
    const kPush = damp(4, dt);
    const m = mesh.instanceMatrix.array as Float32Array;
    const haloPos = haloGeometry.attributes.position.array as Float32Array;
    const haloSize = haloGeometry.attributes.aSize.array as Float32Array;
    const haloAlpha = haloGeometry.attributes.aAlpha.array as Float32Array;
    let maxDelta = 0;

    const tmp = [0, 0, 0];
    const place = (xf: GroupXf, lx: number, ly: number, lz: number) => {
      // Spin (Y) → tilt (X) → roll (Z), then scale into the anchor, then translate.
      const x1 = lx * xf.cY + lz * xf.sY;
      const z1 = -lx * xf.sY + lz * xf.cY;
      const y2 = ly * xf.cX - z1 * xf.sX;
      const z2 = ly * xf.sX + z1 * xf.cX;
      const x3 = x1 * xf.cZ - y2 * xf.sZ;
      const y3 = x1 * xf.sZ + y2 * xf.cZ;
      tmp[0] = xf.cx + x3 * xf.sx;
      tmp[1] = xf.cy + y3 * xf.sy;
      tmp[2] = xf.cz + z2 * xf.sz;
    };

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let la0 = A.local[i3],
        la1 = A.local[i3 + 1],
        la2 = A.local[i3 + 2];
      let lb0 = B.local[i3],
        lb1 = B.local[i3 + 1],
        lb2 = B.local[i3 + 2];
      let sa = A.scale[i];
      let sb = B.scale[i];
      if (ia === STAGE.contact) {
        la0 = lerp(la0, C.local[i3], succ);
        la1 = lerp(la1, C.local[i3 + 1], succ);
        la2 = lerp(la2, C.local[i3 + 2], succ);
        sa = lerp(sa, C.scale[i], succ);
      }
      if (ib === STAGE.contact) {
        lb0 = lerp(lb0, C.local[i3], succ);
        lb1 = lerp(lb1, C.local[i3 + 1], succ);
        lb2 = lerp(lb2, C.local[i3 + 2], succ);
        sb = lerp(sb, C.scale[i], succ);
      }

      place(sim.xfA[A.group[i]], la0, la1, la2);
      const ax = tmp[0],
        ay = tmp[1],
        az = tmp[2];
      place(sim.xfB[B.group[i]], lb0, lb1, lb2);
      const fi = smoother(clamp((f - model.delay[i] * 0.3) / 0.7));
      let tx = lerp(ax, tmp[0], fi);
      let ty = lerp(ay, tmp[1], fi);
      let tz = lerp(az, tmp[2], fi);
      const rawScale = lerp(sa, sb, fi);
      const nodeScale = lerp(A.params.nodeScale, B.params.nodeScale, fi);

      // Idle drift — each node breathes on its own phase.
      if (P.drift > 0) {
        const amp = P.drift * 0.14;
        tx += Math.sin(t * 0.5 + model.phase[i3]) * amp;
        ty += Math.sin(t * 0.43 + model.phase[i3 + 1]) * amp;
        tz += Math.sin(t * 0.37 + model.phase[i3 + 2]) * amp * 0.8;
      }

      // Cursor repulsion.
      let px = 0,
        py = 0,
        pz = 0;
      if (pointerOn) {
        const dx = tx - pointerX;
        const dy = ty - pointerY;
        const d = Math.hypot(dx, dy);
        const R = 1.5;
        if (d < R && d > 1e-4) {
          const k = (1 - d / R) ** 2 * P.pointer * 0.7;
          px = (dx / d) * k;
          py = (dy / d) * k;
          pz = k * 0.6;
        }
      }
      const push = sim.push;
      push[i3] += (px - push[i3]) * kPush;
      push[i3 + 1] += (py - push[i3 + 1]) * kPush;
      push[i3 + 2] += (pz - push[i3 + 2]) * kPush;
      tx += push[i3];
      ty += push[i3 + 1];
      tz += push[i3 + 2];

      const cur = sim.cur;
      if (snap) {
        cur[i3] = tx;
        cur[i3 + 1] = ty;
        cur[i3 + 2] = tz;
      } else {
        const ddx = tx - cur[i3],
          ddy = ty - cur[i3 + 1],
          ddz = tz - cur[i3 + 2];
        cur[i3] += ddx * kPos;
        cur[i3 + 1] += ddy * kPos;
        cur[i3 + 2] += ddz * kPos;
        const md = Math.abs(ddx) + Math.abs(ddy) + Math.abs(ddz);
        if (md > maxDelta) maxDelta = md;
      }

      // QA: nodes confirm with a soft pulse as the scan passes.
      const pulse = P.scan > 0.01 ? Math.exp(-(((cur[i3 + 1] - scanY) * 4) ** 2)) * P.scan : 0;

      const targetScale = rawScale * nodeScale * NODE_RADIUS * (1 + pulse * 0.45);
      sim.scl[i] = snap ? targetScale : sim.scl[i] + (targetScale - sim.scl[i]) * kPos;
      const sc = sim.scl[i];

      // Instance matrix: uniform scale + translation (spheres need no rotation).
      const o = i * 16;
      m[o] = sc;
      m[o + 1] = 0;
      m[o + 2] = 0;
      m[o + 3] = 0;
      m[o + 4] = 0;
      m[o + 5] = sc;
      m[o + 6] = 0;
      m[o + 7] = 0;
      m[o + 8] = 0;
      m[o + 9] = 0;
      m[o + 10] = sc;
      m[o + 11] = 0;
      m[o + 12] = cur[i3];
      m[o + 13] = cur[i3 + 1];
      m[o + 14] = cur[i3 + 2];
      m[o + 15] = 1;

      haloPos[i3] = cur[i3];
      haloPos[i3 + 1] = cur[i3 + 1];
      haloPos[i3 + 2] = cur[i3 + 2] - 0.05;
      haloSize[i] =
        NODE_RADIUS * Math.max(rawScale, 0.4) * (5.5 + pulse * 5) * lerp(1, 0.55, P.night);
      haloAlpha[i] = 0.75 + pulse * 0.6;
    }
    mesh.instanceMatrix.needsUpdate = true;
    haloGeometry.attributes.position.needsUpdate = true;
    haloGeometry.attributes.aSize.needsUpdate = true;
    haloGeometry.attributes.aAlpha.needsUpdate = true;

    // ── connection lines ──
    const iStart = edgeGeometry.attributes.iStart.array as Float32Array;
    const iEnd = edgeGeometry.attributes.iEnd.array as Float32Array;
    const iAlpha = edgeGeometry.attributes.iAlpha.array as Float32Array;
    const iDraw = edgeGeometry.attributes.iDraw.array as Float32Array;
    const cur = sim.cur;
    for (let e = 0; e < E; e++) {
      let alpha = lerp(
        ia === STAGE.contact ? lerp(A.edgeAlpha[e], C.edgeAlpha[e], succ) : A.edgeAlpha[e],
        ib === STAGE.contact ? lerp(B.edgeAlpha[e], C.edgeAlpha[e], succ) : B.edgeAlpha[e],
        fe,
      );
      // Blueprint: grid lines draw themselves in while Discover → Design.
      let draw = 1;
      if (model.edgeSet[e] === EDGE_SET.grid && s < STAGE.design) {
        draw =
          s <= STAGE.discover ? 0 : clamp((s - STAGE.discover) * 1.8 - model.edgeOrder[e] * 0.8);
      }
      if (alpha < 0.002) alpha = 0;
      iAlpha[e] = alpha;
      iDraw[e] = draw;
      if (alpha === 0) continue;
      const a3 = model.edges[e * 2] * 3;
      const b3 = model.edges[e * 2 + 1] * 3;
      const e3 = e * 3;
      iStart[e3] = cur[a3];
      iStart[e3 + 1] = cur[a3 + 1];
      iStart[e3 + 2] = cur[a3 + 2];
      iEnd[e3] = cur[b3];
      iEnd[e3 + 1] = cur[b3 + 1];
      iEnd[e3 + 2] = cur[b3 + 2];
    }
    edgeGeometry.attributes.iStart.needsUpdate = true;
    edgeGeometry.attributes.iEnd.needsUpdate = true;
    edgeGeometry.attributes.iAlpha.needsUpdate = true;
    edgeGeometry.attributes.iDraw.needsUpdate = true;

    // ── uniforms ──
    const eu = edgeMaterial.uniforms;
    eu.uResolution.value.set(W * dpr, H * dpr);
    eu.uWidth.value = quality.lineWidth * 2 * dpr;
    eu.uTime.value = t;
    eu.uFlow.value = P.flow;
    eu.uScan.value = P.scan;
    eu.uScanY.value = scanY;
    eu.uNight.value = P.night;
    eu.uIntensity.value = P.line;

    const hu = haloMaterial.uniforms;
    hu.uPx.value = (H * dpr) / (2 * TAN_HALF_FOV);
    hu.uNightMix.value = P.night;
    hu.uOpacity.value = P.halo;

    mesh.visible = P.nodeScale > 0.001 || sim.scl.some((v) => v > 0.0005);

    latticeStore.settling = !sim.init || maxDelta > 0.002;
    sim.init = true;
    if (!sim.readySent) {
      sim.readySent = true;
      requestAnimationFrame(() => setLatticeReady());
    }
  });

  return (
    <>
      <points
        geometry={haloGeometry}
        material={haloMaterial}
        frustumCulled={false}
        renderOrder={-1}
      />
      <instancedMesh ref={meshRef} args={[sphere, nodeMaterial, N]} frustumCulled={false} />
      <mesh geometry={edgeGeometry} material={edgeMaterial} frustumCulled={false} renderOrder={2} />
    </>
  );
}
