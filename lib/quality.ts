/**
 * Device-quality detection. Decides how much 3D the device can comfortably
 * render. Every tier keeps the lattice, parallax, and depth; lower tiers trade
 * node count, glass transmission, and resolution for a steady frame rate.
 */

export type QualityTier = "high" | "medium" | "low";

export interface QualityPreset {
  tier: QualityTier;
  /** Lattice grid dimensions (node count = x*y*z). */
  grid: [number, number, number];
  /** Real glass (MeshPhysicalMaterial transmission) — the most expensive feature. */
  transmission: boolean;
  /** Max device-pixel-ratio for the canvas. */
  dpr: number;
  antialias: boolean;
  /** Sphere subdivision detail. */
  detail: number;
  /** Environment map resolution. */
  envResolution: number;
  /** Half-width of connection-line glow, in CSS px. */
  lineWidth: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  high: {
    tier: "high",
    grid: [5, 5, 5],
    transmission: true,
    dpr: 2,
    antialias: true,
    detail: 3,
    envResolution: 128,
    lineWidth: 5,
  },
  medium: {
    tier: "medium",
    grid: [4, 4, 4],
    transmission: false,
    dpr: 1.5,
    antialias: true,
    detail: 2,
    envResolution: 64,
    lineWidth: 4,
  },
  low: {
    tier: "low",
    grid: [4, 4, 3],
    transmission: false,
    dpr: 1,
    antialias: false,
    detail: 2,
    envResolution: 32,
    lineWidth: 3.5,
  },
};

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

/** Returns the GPU renderer string, or null if WebGL is unavailable. */
function probeWebGL(): { renderer: string } | null {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { renderer };
  } catch {
    return null;
  }
}

export function detectQuality(): { webgl: boolean; preset: QualityPreset } {
  // QA override: ?lattice=high|medium|low|fallback
  const forced = new URLSearchParams(window.location.search).get("lattice");
  if (forced === "fallback") return { webgl: false, preset: QUALITY_PRESETS.low };
  if (forced && forced in QUALITY_PRESETS && probeWebGL()) {
    return { webgl: true, preset: QUALITY_PRESETS[forced as QualityTier] };
  }

  const gl = probeWebGL();
  if (!gl) return { webgl: false, preset: QUALITY_PRESETS.low };

  const nav = navigator as NavigatorWithHints;
  const renderer = gl.renderer.toLowerCase();
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.screen.width, window.screen.height) < 820;
  const saveData = nav.connection?.saveData === true;

  // Software renderers: WebGL "works" but is painfully slow → SVG fallback.
  if (/swiftshader|llvmpipe|software/.test(renderer)) {
    return { webgl: false, preset: QUALITY_PRESETS.low };
  }

  const weakGpu = /mali-4|mali-t|adreno \(tm\) [1-5]\d\d|powervr|intel\(r\) hd graphics [2-5]/.test(
    renderer,
  );

  if (saveData || weakGpu || memory <= 2 || cores <= 2) {
    return { webgl: true, preset: QUALITY_PRESETS.low };
  }
  if (coarse || small || memory <= 4 || cores <= 4) {
    return { webgl: true, preset: QUALITY_PRESETS.medium };
  }
  return { webgl: true, preset: QUALITY_PRESETS.high };
}
