
/**
 * Logo. Uses the real logo when `site.logo.src` is set (see content/site.ts),
 * otherwise a placeholder: a three-node lattice mark + wordmark.
 */

import Image from "next/image";
import { site } from "@/content/site";

export function LogoMark({
  className = "h-8 w-8",
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "light";
}) {
  const light = tone === "light";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable={false}>
      <defs>
        <linearGradient id={`lm-${tone}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light ? "#BFDBFE" : "#1D4ED8"} />
          <stop offset="0.55" stopColor={light ? "#93C5FD" : "#3B82F6"} />
          <stop offset="1" stopColor={light ? "#DBEAFE" : "#93C5FD"} />
        </linearGradient>
      </defs>
      <path
        d="M20 6 L33 28 L7 28 Z M20 6 L20 19 M33 28 L20 19 M7 28 L20 19"
        fill="none"
        stroke={`url(#lm-${tone})`}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="20" cy="6" r="4" fill={`url(#lm-${tone})`} />
      <circle cx="33" cy="28" r="4" fill={`url(#lm-${tone})`} />
      <circle cx="7" cy="28" r="4" fill={`url(#lm-${tone})`} />
      <circle cx="20" cy="19" r="3" fill={light ? "#ffffff" : "#1D4ED8"} />
    </svg>
  );
}

export function Logo({
  tone = "brand",
  className = "",
}: {
  tone?: "brand" | "light";
  className?: string;
}) {
  if (site.logo.src) {
    return (
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        priority
        className={className}
      />
    );
  }

  const light = tone === "light";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo/logo.png"
        alt="SVR Tech Groups"
        width={32}
        height={32}
        priority
        className="h-8 w-8 shrink-0 object-contain"
      />

      <span className="flex flex-col leading-none">
        <span className="flex flex-row items-center gap-2 leading-none">
          <span
            className={`font-display text-[1.05rem] font-bold tracking-[-0.02em] ${
              light ? "text-white" : "text-navy"
            }`}
          >
            SVR
          </span>

          <span
          className={`font-display text-[1.05rem] font-bold tracking-[-0.02em] ${
          light ? "text-white" : "text-navy"
           }`}
           >
          TECH GROUPS
        </span>
        </span>

        <span
          className={`mt-1 text-[0.55rem] font-medium tracking-[0.16em] uppercase ${
            light ? "text-glow" : "text-muted"
          }`}
        >
          Software Company
        </span>
      </span>
    </span>
  );
}
