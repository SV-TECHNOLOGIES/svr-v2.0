"use client";

/**
 * Physical button: magnetic pull towards the cursor (desktop), a perspective
 * tilt, a moving light glare, and layered blue shadows. In-page "#hash" links
 * scroll smoothly through Lenis.
 */

import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type Variant = "primary" | "secondary" | "light";

interface Props {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: "md" | "lg";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  "aria-label"?: string;
  iconAfter?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: "btn-primary text-white",
  secondary: "btn-secondary text-navy",
  light: "btn-light text-navy",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  onClick,
  className = "",
  iconAfter,
  ...aria
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const { scrollTo } = useSmoothScroll();
  const spring = { stiffness: 260, damping: 20, mass: 0.5 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const interactive = fine && !reduced && !disabled;

  const onMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || !interactive) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.22);
    y.set(dy * 0.3);
    el.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
    el.style.setProperty("--rx", `${(-dy / r.height) * 12}deg`);
    el.style.setProperty("--ry", `${(dx / r.width) * 10}deg`);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  const onAnchorClick = (e: MouseEvent) => {
    onClick?.();
    if (href?.startsWith("#")) {
      e.preventDefault();
      scrollTo(href);
      history.replaceState(null, "", href);
    }
  };

  const classes = `btn group ${size === "lg" ? "btn-lg" : "btn-md"} ${VARIANTS[variant]} ${className}`;
  const inner = (
    <>
      <span className="btn-glare" aria-hidden />
      <span className="btn-face">
        {children}
        {iconAfter && (
          <span className="ease-svr transition-transform duration-500 group-hover:translate-x-0.5">
            {iconAfter}
          </span>
        )}
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        style={{ x, y }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={onAnchorClick}
        className={classes}
        {...aria}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      className={classes}
      {...aria}
    >
      {inner}
    </motion.button>
  );
}
