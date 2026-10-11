"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { EASE } from "@/lib/constants";

/**
 * Counts up to `value` when scrolled into view. Server-renders the final value
 * (good for SEO and no-JS), and shows it immediately for reduced motion.
 */
export function CountUp({
  value,
  suffix = "",
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already visible: keep final value
    setDisplay(0);
    let stop: (() => void) | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const controls = animate(0, value, {
          duration,
          ease: EASE,
          onUpdate: (v) => setDisplay(Math.round(v)),
        });
        stop = () => controls.stop();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
