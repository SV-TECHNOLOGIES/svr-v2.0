"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { GSAP_EASE } from "./constants";

let registered = false;

/** Registers GSAP plugins and the site-wide easing curve exactly once. */
export function setupGsap() {
  if (registered || typeof window === "undefined") return gsap;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(GSAP_EASE, "0.22,1,0.36,1");
  gsap.defaults({ ease: GSAP_EASE });
  registered = true;
  return gsap;
}

export { gsap, ScrollTrigger };
