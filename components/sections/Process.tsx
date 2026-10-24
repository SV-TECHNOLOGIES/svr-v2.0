"use client";

/**
 * How We Build — the pinned, scroll-driven centerpiece.
 *
 * The section is tall (5 steps × ~1 viewport). Its inner frame is sticky, so
 * it stays pinned while the scroll position advances through the steps. The
 * lattice morphs through stages 1–5 (declared with data-lattice-stage="1-5"):
 * Discover → Design → Build → QA → Launch.
 *
 * Reduced motion: no pinning — all five steps are listed, and a still,
 * assembled lattice sits beside them.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { howWeBuild as process } from "@/content/site";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { Check } from "@/components/ui/icons";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { setupGsap, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const steps = process.steps;
const COUNT = steps.length;

type ProcessProps = {
  compact?: boolean;
  showViewAll?: boolean;
};

export function Process({
  compact = false,
  showViewAll = false,
}: ProcessProps) {
  if (compact) {
    return <ProcessCompact showViewAll={showViewAll} />;
  }

  const reduced = usePrefersReducedMotion();

  return reduced ? <ProcessStatic /> : <ProcessPinned />;
}



function ProcessCompact({
  showViewAll,
}: {
  showViewAll: boolean;
}) {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      data-lattice-stage="1-5"
      className="relative overflow-hidden py-16 md:py-20"
    >
      <FarLayer
        glows={[
          {
            x: "75%",
            y: "30%",
            size: 700,
            color: "rgb(59 130 246 / 0.10)",
          },
        ]}
      />

      <div className="container-site layer-near">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{process.eyebrow}</p>

            <h2
              id="process-title"
              className="font-display text-h2 text-navy mt-3 font-semibold"
            >
              {process.title}
            </h2>

            <p className="text-muted mx-auto mt-4 max-w-2xl leading-relaxed">
              {process.intro}
            </p>
          </div>
        </Reveal>

        <Reveal
          as="ol"
          stagger={0.08}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-display text-lg font-bold text-blue-700">
                {step.number}
              </div>

              <h3 className="font-display mt-4 text-lg font-semibold text-navy">
                {step.title}
              </h3>

              <p className="text-muted mt-2 text-sm leading-relaxed">
                {step.body}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {step.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {point}
                  </li>
                ))}
              </ul>

              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-8 z-10 hidden text-xl text-blue-400 lg:block"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </Reveal>

        {showViewAll && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/process"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              View Full Process
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


function ProcessPinned() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    setupGsap();
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const idx = Math.min(COUNT - 1, Math.floor(self.progress * COUNT));
        setActive((prev) => (prev === idx ? prev : idx));
        railRef.current?.style.setProperty("--p", self.progress.toFixed(4));
      },
    });
    triggerRef.current = st;
    return () => st.kill();
  }, []);

  const goTo = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    scrollTo(st.start + ((i + 0.5) / COUNT) * (st.end - st.start), { offset: 0 });
  };

  const step = steps[active];

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-labelledby="process-title"
      data-lattice-stage="1-5"
      data-lattice-still="5"
      data-scroll-offset="0"
      className="relative"
      style={{ height: `${COUNT * 100 + 60}svh` }}
    >
      {/* far layer (pinned): glows, grid, oversized step number */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <FarLayer
            speed={0.15}
            glows={[
              { x: "72%", y: "50%", size: 980, color: "rgb(59 130 246 / 0.14)" },
              { x: "8%", y: "85%", size: 600, color: "rgb(147 197 253 / 0.22)" },
            ]}
          />
          <ParallaxLayer
            speed={0.08}
            mouse={10}
            className="absolute right-[-2vw] bottom-[-6vw] md:right-[2vw]"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={step.number}
                initial={{ opacity: 0, y: 60, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -60, scale: 1.04 }}
                transition={{ duration: 0.9, ease: EASE }}
                className="font-display text-primary/[0.045] block text-[42vw] leading-none font-bold tracking-[-0.06em] select-none md:text-[24vw]"
              >
                {step.number}
              </motion.span>
            </AnimatePresence>
          </ParallaxLayer>
        </div>
      </div>

      {/* near layer (pinned) */}
      <div className="sticky top-0 z-[2] h-[100svh]">
        <div className="container-site grid h-full grid-cols-1 content-start gap-y-4 pt-20 pb-6 md:grid-cols-12 md:content-center md:gap-x-10 md:pt-16 md:pb-0">
          {/* heading */}
          <Reveal className="md:col-span-5 md:row-start-1">
            <p className="eyebrow">{process.eyebrow}</p>
            <h2
              id="process-title"
              className="font-display text-h2 text-navy mt-3 max-w-[22ch] font-semibold md:mt-4"
            >
              {process.title}
            </h2>
            <p className="text-muted mt-3 hidden max-w-[44ch] md:block [@media(max-height:780px)]:hidden">
              {process.intro}
            </p>
          </Reveal>

          {/* lattice stage (mid layer anchor) */}
          <div className="relative h-[30svh] min-h-48 md:col-span-7 md:col-start-6 md:row-span-3 md:row-start-1 md:h-[72vh]">
            <div data-lattice-anchor="process-stage" className="absolute inset-0" />
            <StageIndicators active={active} />
          </div>

          {/* progress rail */}
          <div
            ref={railRef}
            className="md:col-span-5 md:row-start-2"
            style={{ "--p": 0 } as React.CSSProperties}
          >
            <ol
              className="relative flex justify-between gap-1 md:flex-col md:gap-0"
              aria-label="Build steps"
            >
              <span
                aria-hidden
                className="bg-line absolute top-4 right-4 left-4 h-px md:top-2 md:bottom-2 md:left-4 md:h-auto md:w-px"
              />
              <span
                aria-hidden
                className="rail-fill from-primary to-accent absolute top-4 right-4 left-4 h-px bg-gradient-to-r md:top-2 md:right-auto md:bottom-2 md:left-4 md:h-auto md:w-px md:bg-gradient-to-b"
              />
              {steps.map((s, i) => {
                const state = i < active ? "done" : i === active ? "active" : "next";
                return (
                  <li key={s.number} className="relative">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={state === "active" ? "step" : undefined}
                      aria-label={`Step ${s.number}: ${s.title}`}
                      className="group flex items-center gap-3 rounded-full py-1 md:py-1"
                    >
                      <span
                        className={`ease-svr relative z-[1] flex h-8 w-8 items-center justify-center rounded-full border text-[0.75rem] font-semibold tabular-nums transition-all duration-500 ${
                          state === "active"
                            ? "border-primary bg-primary text-white shadow-[0_6px_18px_-6px_rgb(29_78_216/0.7)]"
                            : state === "done"
                              ? "border-primary/40 text-primary bg-white"
                              : "border-line text-muted group-hover:border-primary/40 bg-white"
                        }`}
                      >
                        {s.number}
                      </span>
                      <span
                        className={`ease-svr hidden text-[0.9375rem] font-medium transition-colors duration-500 md:inline ${
                          state === "active" ? "text-navy" : "text-muted group-hover:text-ink"
                        }`}
                      >
                        {s.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* active step content */}
          <div
            className="relative min-h-44 md:col-span-5 md:row-start-3 md:min-h-56"
            style={{ perspective: 900 }}
            aria-hidden
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 26, z: -120 }}
                animate={{ opacity: 1, y: 0, z: 0 }}
                exit={{ opacity: 0, y: -18, z: 60, transition: { duration: 0.28, ease: EASE } }}
                transition={{ duration: 0.6, ease: EASE }}
                className="glass shadow-card rounded-[var(--radius-card)] p-5 md:p-6"
              >
                <p className="text-primary text-sm font-semibold tabular-nums">
                  Step {step.number}
                </p>
                <h3 className="font-display text-h3 text-navy mt-1 font-semibold md:text-[1.625rem]">
                  {step.title}
                </h3>
                <p className="text-muted mt-2 text-[0.9375rem] leading-relaxed md:mt-3 md:text-base">
                  {step.body}
                </p>
                <ul className="mt-4 hidden flex-wrap gap-2 sm:flex [@media(max-height:720px)]:hidden">
                  {step.points.map((pt) => (
                    <li
                      key={pt}
                      className="bg-bg-tint text-navy inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8125rem] font-medium"
                    >
                      <Check className="text-primary h-3.5 w-3.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* full content for assistive tech (the animated panel above is visual only) */}
          <ol className="sr-only">
            {steps.map((s) => (
              <li key={s.number}>
                <h3>
                  {s.number} {s.title}
                </h3>
                <p>{s.body}</p>
                <ul>
                  {s.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Small live labels beside the lattice for Build, QA, and Launch. */
function StageIndicators({ active }: { active: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-2 left-0 md:bottom-10 md:left-4"
      style={{ perspective: 800 }}
    >
      <AnimatePresence mode="wait">
        {active === 2 && (
          <motion.div
            key="build"
            initial={{ opacity: 0, y: 14, z: -60 }}
            animate={{ opacity: 1, y: 0, z: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="glass shadow-card w-56 rounded-2xl p-3.5"
          >
            <p className="text-navy text-[0.75rem] font-semibold">{process.indicators.build}</p>
            <div className="mt-2.5 flex items-end gap-1">
              {[0.35, 0.5, 0.45, 0.7, 0.62, 0.85, 0.95].map((h, i) => (
                <motion.span
                  key={i}
                  className="from-primary to-accent w-full rounded-sm bg-gradient-to-t"
                  initial={{ height: 2 }}
                  animate={{ height: h * 28 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.06 }}
                />
              ))}
            </div>
            <div className="flow-track mt-2.5 h-0.5 w-full rounded-full opacity-70" />
          </motion.div>
        )}
        {active === 3 && (
          <motion.ul
            key="qa"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
            variants={{ show: { transition: { staggerChildren: 0.18 } } }}
            className="flex flex-col gap-1.5"
          >
            {process.indicators.qa.map((label) => (
              <motion.li
                key={label}
                variants={{
                  hidden: { opacity: 0, x: -14, z: -40 },
                  show: { opacity: 1, x: 0, z: 0 },
                }}
                transition={{ duration: 0.5, ease: EASE }}
                className="glass text-navy shadow-chip inline-flex w-fit items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[0.8125rem] font-medium"
              >
                <span className="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-white">
                  <Check className="h-3 w-3" strokeWidth={2.6} />
                </span>
                {label}
              </motion.li>
            ))}
          </motion.ul>
        )}
        {active === 4 && (
          <motion.div
            key="launch"
            initial={{ opacity: 0, y: 14, z: -60 }}
            animate={{ opacity: 1, y: 0, z: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="glass text-navy shadow-card inline-flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 text-sm font-semibold"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="live-ping absolute inset-0 rounded-full bg-emerald-500" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {process.indicators.launch}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProcessStatic() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      data-lattice-stage="1-5"
      data-lattice-still="5"
      className="relative py-24 md:py-32"
    >
      <FarLayer glows={[{ x: "75%", y: "30%", size: 900 }]} />
      <div className="container-site layer-near grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="eyebrow">{process.eyebrow}</p>
          <h2
            id="process-title"
            className="font-display text-h1 text-navy mt-4 max-w-[18ch] font-semibold"
          >
            {process.title}
          </h2>
          <p className="text-lead text-muted mt-5 max-w-[48ch]">{process.intro}</p>
          <ol className="mt-10 flex flex-col gap-4">
            {steps.map((s) => (
              <li key={s.number} className="glass shadow-card rounded-[var(--radius-card)] p-6">
                <p className="text-primary text-sm font-semibold tabular-nums">Step {s.number}</p>
                <h3 className="font-display text-h3 text-navy mt-1 font-semibold">{s.title}</h3>
                <p className="text-muted mt-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative h-[60vh] md:col-span-6">
          <div data-lattice-anchor="process-stage" className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
