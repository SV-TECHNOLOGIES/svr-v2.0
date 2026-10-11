import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}

/** Eyebrow + title + intro, consistent across sections. Children animate via <Reveal>. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
  tone = "dark",
}: Props) {
  const center = align === "center";
  return (
    <>
      <p
        className={`eyebrow ${center ? "justify-center" : ""} ${tone === "light" ? "text-glow" : ""}`}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`font-display text-h1 mt-4 font-semibold text-balance ${tone === "light" ? "text-white" : "text-navy"} ${
          center ? "mx-auto max-w-[20ch] text-center" : "max-w-[20ch]"
        }`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`text-lead text-muted mt-5 max-w-[52ch] ${center ? "mx-auto text-center" : ""}`}
        >
          {intro}
        </p>
      )}
    </>
  );
}
