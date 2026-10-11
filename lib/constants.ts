/**
 * Motion + layout constants shared by CSS, GSAP, and Framer Motion so every
 * animation on the site uses the same curve and rhythm.
 */

/** The one easing curve used site-wide. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Name registered with GSAP's CustomEase (see lib/gsap.ts). */
export const GSAP_EASE = "svr";

/** Reveal durations (seconds) — content reveals from depth in 500–700ms. */
export const DURATION = { fast: 0.5, base: 0.6, slow: 0.7 } as const;
export const STAGGER = 0.08;

/** Fixed navbar height (px) used for anchor scroll offsets. */
export const NAV_OFFSET = 72;

/**
 * Lattice stages. Sections declare which stage they show with
 * `data-lattice-stage`, and the lattice morphs between adjacent stages.
 */
export const STAGE = {
  hero: 0,
  discover: 1,
  design: 2,
  build: 3,
  qa: 4,
  launch: 5,
  impact: 6,
  services: 7,
  testimonials: 8,
  contact: 9,
  footer: 10,
} as const;
export const STAGE_COUNT = 11;
