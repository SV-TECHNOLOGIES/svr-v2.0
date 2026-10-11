import type { ReactNode } from "react";

/** Small rounded label with a subtle glass depth. */
export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "soft";
  className?: string;
}) {
  return (
    <span
      className={`shadow-chip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium ${
        tone === "soft"
          ? "border-primary/10 bg-bg-tint text-primary"
          : "border-line text-ink bg-white/80 backdrop-blur-sm"
      } ${className}`}
    >
      {children}
    </span>
  );
}
