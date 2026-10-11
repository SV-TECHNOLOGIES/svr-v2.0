/**
 * Tiny mutable store shared by the DOM (scroll director, sections) and the
 * WebGL scene. It is deliberately NOT React state: the scene reads it every
 * frame, and writing to it never triggers a React render.
 *
 * The few values the UI must react to (render mode, readiness) are exposed
 * through `subscribe` for useSyncExternalStore.
 */

export type LatticeMode = "pending" | "webgl" | "fallback";

type Listener = () => void;
const listeners = new Set<Listener>();

export const latticeStore = {
  /** Continuous stage derived from scroll position (0 … STAGE_COUNT-1). */
  stage: 0,
  /** Pointer in normalized device coords (-1…1). */
  pointer: { x: 0, y: 0, active: false },
  /** 0 → 1 when the contact form succeeds (lattice assembles fully). */
  contactSuccess: 0,
  /** Timestamp (ms) of the last scroll/pointer/state change. */
  lastActivity: 0,
  /** True while nodes are still travelling towards their targets. */
  settling: true,
  /** Reduced-motion: set when a static re-render is required. */
  dirty: true,
  reducedMotion: false,
  mode: "pending" as LatticeMode,
  ready: false,
};

export function touchLattice() {
  latticeStore.lastActivity = performance.now();
  latticeStore.dirty = true;
}

export function setLatticeMode(mode: LatticeMode) {
  if (latticeStore.mode === mode) return;
  latticeStore.mode = mode;
  listeners.forEach((l) => l());
}

export function setLatticeReady() {
  if (latticeStore.ready) return;
  latticeStore.ready = true;
  listeners.forEach((l) => l());
}

export function setContactSuccess(value: 0 | 1) {
  latticeStore.contactSuccess = value;
  touchLattice();
}

export function subscribeLattice(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
