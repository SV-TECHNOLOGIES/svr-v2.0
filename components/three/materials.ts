/**
 * Lattice materials.
 *
 * - Glass nodes: MeshPhysicalMaterial with real transmission on capable GPUs,
 *   a clear-coated glossy fallback elsewhere.
 * - Connection lines: instanced screen-space quads with a soft glow falloff
 *   baked into the shader. This gives the "bloom" look on a white page
 *   (additive post-process bloom is invisible on white) at near-zero cost, and
 *   carries the blueprint draw-in, particle flow, and QA scan effects.
 * - Halos: soft glow sprites behind each node; they become the faint glowing
 *   points of the navy footer.
 */

import * as THREE from "three";
import type { QualityPreset } from "@/lib/quality";

export const PALETTE = {
  primary: new THREE.Color("#1D4ED8"),
  accent: new THREE.Color("#3B82F6"),
  glow: new THREE.Color("#93C5FD"),
  nightCore: new THREE.Color("#DBEAFE"),
  nightGlow: new THREE.Color("#60A5FA"),
};

/** Per-instance tints (multiplied with the base color). */
export const NODE_TINTS = {
  glass: ["#ffffff", "#e0ecff", "#c7dcff", "#a9c9ff"],
  solid: ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA"],
};

export function createNodeMaterial(q: QualityPreset): THREE.Material {
  if (q.transmission) {
    return new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transmission: 1,
      thickness: 0.9,
      roughness: 0.08,
      ior: 1.45,
      attenuationColor: new THREE.Color("#2f6cf0"),
      attenuationDistance: 0.55,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      specularIntensity: 1,
      envMapIntensity: 1.35,
    });
  }
  if (q.tier === "medium") {
    return new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.25,
    });
  }
  return new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.22,
    metalness: 0.08,
    envMapIntensity: 1.2,
  });
}

// ─── connection lines ────────────────────────────────────────────────────────

const edgeVertex = /* glsl */ `
  attribute vec3 iStart;
  attribute vec3 iEnd;
  attribute float iAlpha;
  attribute float iDraw;
  attribute float iSeed;

  uniform vec2 uResolution; // drawing-buffer size in device px
  uniform float uWidth;      // full quad width in device px

  varying vec2 vUv;
  varying float vAlpha;
  varying float vSeed;
  varying float vDraw;
  varying float vWorldY;

  void main() {
    vUv = vec2(position.x, position.y);
    vAlpha = iAlpha;
    vSeed = iSeed;
    vDraw = iDraw;
    if (iAlpha < 0.002 || iDraw < 0.001) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // collapse invisible edges
      return;
    }
    vec4 a = projectionMatrix * modelViewMatrix * vec4(iStart, 1.0);
    vec4 b = projectionMatrix * modelViewMatrix * vec4(iEnd, 1.0);
    vec2 sa = a.xy / a.w * uResolution;
    vec2 sb = b.xy / b.w * uResolution;
    vec2 dir = sb - sa;
    float len = length(dir);
    dir = len > 0.0001 ? dir / len : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    vec4 p = mix(a, b, position.x);
    vWorldY = mix(iStart.y, iEnd.y, position.x);
    p.xy += nrm * position.y * uWidth / uResolution * p.w;
    gl_Position = p;
  }
`;

const edgeFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFlow;
  uniform float uScan;
  uniform float uScanY;
  uniform float uNight;
  uniform float uIntensity;
  uniform float uCore;
  uniform vec3 uCoreDay;
  uniform vec3 uGlowDay;
  uniform vec3 uCoreNight;
  uniform vec3 uGlowNight;

  varying vec2 vUv;
  varying float vAlpha;
  varying float vSeed;
  varying float vDraw;
  varying float vWorldY;

  void main() {
    if (vUv.x > vDraw) discard;
    float across = abs(vUv.y);
    float core = 1.0 - smoothstep(uCore * 0.5, uCore, across);
    float glow = exp(-across * across * 5.0);

    // Particle flow: bright packets travelling along the line.
    float f = fract(vUv.x * 1.5 - uTime * (0.55 + vSeed * 0.5) + vSeed * 7.0);
    float packet = smoothstep(0.86, 0.97, f) * (1.0 - smoothstep(0.97, 1.0, f));
    float flow = packet * uFlow;

    // QA scan band.
    float scan = exp(-pow((vWorldY - uScanY) * 3.2, 2.0)) * uScan;

    // Fade the tip while drawing so lines extend smoothly.
    float tip = vDraw >= 0.999 ? 1.0 : smoothstep(vDraw, vDraw - 0.08, vUv.x);

    vec3 coreCol = mix(uCoreDay, uCoreNight, uNight);
    vec3 glowCol = mix(uGlowDay, uGlowNight, uNight);
    vec3 col = mix(glowCol, coreCol, core);
    col = mix(col, glowCol, (flow + scan) * 0.6);

    float a = core * 0.7 + glow * (0.2 + flow * 0.9 + scan * 0.8);
    a *= vAlpha * uIntensity * tip;
    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

export function createEdgeMaterial(q: QualityPreset) {
  return new THREE.ShaderMaterial({
    vertexShader: edgeVertex,
    fragmentShader: edgeFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uWidth: { value: q.lineWidth },
      uCore: { value: 1.6 / q.lineWidth },
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uScan: { value: 0 },
      uScanY: { value: 0 },
      uNight: { value: 0 },
      uIntensity: { value: 1 },
      uCoreDay: { value: PALETTE.primary.clone().lerp(PALETTE.accent, 0.35) },
      uGlowDay: { value: PALETTE.accent.clone() },
      uCoreNight: { value: PALETTE.nightCore.clone() },
      uGlowNight: { value: PALETTE.nightGlow.clone() },
    },
  });
}

/** Instanced quad: x ∈ [0,1] along the edge, y ∈ [-1,1] across it. */
export function createEdgeGeometry(edgeCount: number, seeds: Float32Array) {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3),
  );
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const dyn = (size: number) => {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(edgeCount * size), size);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  };
  geo.setAttribute("iStart", dyn(3));
  geo.setAttribute("iEnd", dyn(3));
  geo.setAttribute("iAlpha", dyn(1));
  geo.setAttribute("iDraw", dyn(1));
  geo.setAttribute("iSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  geo.instanceCount = edgeCount;
  return geo;
}

// ─── halos / glowing points ──────────────────────────────────────────────────

const haloVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPx;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPx / -mv.z;
    vAlpha = aAlpha;
    gl_Position = projectionMatrix * mv;
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uDay;
  uniform vec3 uNight;
  uniform float uNightMix;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float day = exp(-d * d * 3.5) * (1.0 - d) * 0.42;
    float nightCore = smoothstep(0.22, 0.0, d);
    float night = exp(-d * d * 7.0) * 0.55 + nightCore * 0.6;
    float a = mix(day, night, uNightMix);
    vec3 col = mix(uDay, mix(uNight, vec3(0.92, 0.96, 1.0), nightCore), uNightMix);
    gl_FragColor = vec4(col, a * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

export function createHaloMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: haloVertex,
    fragmentShader: haloFragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uPx: { value: 1 },
      uDay: { value: PALETTE.accent.clone() },
      uNight: { value: PALETTE.glow.clone() },
      uNightMix: { value: 0 },
      uOpacity: { value: 1 },
    },
  });
}

export function createHaloGeometry(count: number) {
  const geo = new THREE.BufferGeometry();
  const dyn = (size: number) => {
    const a = new THREE.BufferAttribute(new Float32Array(count * size), size);
    a.setUsage(THREE.DynamicDrawUsage);
    return a;
  };
  geo.setAttribute("position", dyn(3));
  geo.setAttribute("aSize", dyn(1));
  geo.setAttribute("aAlpha", dyn(1));
  return geo;
}
