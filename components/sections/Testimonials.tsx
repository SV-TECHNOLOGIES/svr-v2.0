"use client";

/**
 * Testimonials — lattice stage 8: the lattice dims into a calm background
 * constellation. Cards form a 3D deck in perspective: scrolling (pinned),
 * dragging, the arrow buttons, or ←/→ keys bring the next card forward while
 * the others recede in depth. Oversized quote marks drift in the far layer.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { testimonials } from "@/content/site";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TodoBadge } from "@/components/ui/TodoBadge";
import { ChevronLeft, ChevronRight, QuoteMark, Star, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { setupGsap, ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const items = testimonials.items;
const COUNT = items.length;

export function Testimonials() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const manual = useRef(false);
  const pos = useMotionValue(0); // continuous deck position (0 … COUNT-1)
  const [active, setActive] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => pos.on("change", (v) => setActive(Math.round(v))), [pos]);

  // Pinned mode: scroll progress through the section drives the deck.
  useEffect(() => {
    if (reduced) return;
    setupGsap();
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (manual.current) return;
        pos.set(Math.min(COUNT - 1, Math.max(0, self.progress * (COUNT - 0.6) - 0.2)));
      },
    });
    triggerRef.current = st;
    return () => st.kill();
  }, [reduced, pos]);

  const goTo = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(COUNT - 1, i));
      const st = triggerRef.current;
      manual.current = true;
      animate(pos, target, { duration: 0.7, ease: EASE });
      if (st && !reduced) {
        // Keep scroll position in sync so scrolling continues from this card.
        const progress = (target + 0.2) / (COUNT - 0.6);
        scrollTo(st.start + Math.min(1, progress) * (st.end - st.start), {
          offset: 0,
          onComplete: () => (manual.current = false),
        });
        window.setTimeout(() => (manual.current = false), 1600);
      } else {
        manual.current = false;
      }
    },
    [pos, reduced, scrollTo],
  );

  const dragStart = useRef(0);
  const onPanStart = () => {
    dragStart.current = pos.get();
    manual.current = true;
  };
  const onPan = (_: PointerEvent, info: PanInfo) => {
    pos.set(Math.max(-0.3, Math.min(COUNT - 0.7, dragStart.current - info.offset.x / 320)));
  };
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const projected = pos.get() - info.velocity.x / 2000;
    goTo(Math.round(projected));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="testimonials-title"
      data-lattice-stage="8"
      data-scroll-offset="0"
      className="relative"
      style={{ height: reduced ? undefined : `${COUNT * 55 + 100}svh` }}
    >
      {/* far layer: glows + oversized drifting quote marks */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className={reduced ? "relative h-full" : "sticky top-0 h-[100svh] overflow-hidden"}>
          <FarLayer
            speed={0.12}
            glows={[
              { x: "50%", y: "55%", size: 1100, color: "rgb(59 130 246 / 0.1)" },
              { x: "10%", y: "20%", size: 600, color: "rgb(147 197 253 / 0.22)" },
            ]}
          >
            <ParallaxLayer speed={0.3} mouse={30} className="absolute top-[12%] left-[4%]">
              <QuoteMark className="text-primary/[0.06] h-40 w-52 md:h-64 md:w-80" />
            </ParallaxLayer>
            <ParallaxLayer
              speed={0.45}
              mouse={40}
              className="absolute right-[6%] bottom-[8%] rotate-180"
            >
              <QuoteMark className="text-accent/[0.08] h-32 w-44 md:h-52 md:w-64" />
            </ParallaxLayer>
          </FarLayer>
        </div>
      </div>

      {/* near layer */}
      <div
        className={
          reduced
            ? "relative z-[2] py-24"
            : "sticky top-0 z-[2] flex h-[100svh] flex-col justify-center"
        }
      >
        <div
          data-lattice-anchor="testimonials-stage"
          aria-hidden
          className="pointer-events-none absolute inset-0"
        />
        <div className="container-site relative pt-16">
          <Reveal className="text-center">
            <SectionHeading
              eyebrow={testimonials.eyebrow}
              title={testimonials.title}
              id="testimonials-title"
              align="center"
            />
          </Reveal>

          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Client testimonials"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="relative mx-auto mt-10 h-[min(420px,52svh)] max-w-2xl rounded-[var(--radius-card)] md:mt-14"
          >
            <motion.div
              className="relative h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
              style={{ perspective: 1200 }}
              onPanStart={onPanStart}
              onPan={onPan}
              onPanEnd={onPanEnd}
            >
              {items.map((t, i) => (
                <DeckCard key={i} index={i} pos={pos} active={active === i} t={t} />
              ))}
            </motion.div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label="Previous testimonial"
                className="border-line text-navy shadow-chip ease-svr hover:border-primary/30 hover:shadow-card inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/80 backdrop-blur transition-all duration-500 disabled:opacity-40"
              >
                <ChevronLeft />
              </button>
              <div className="flex items-center gap-2" role="group" aria-label="Choose testimonial">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show testimonial ${i + 1} of ${COUNT}`}
                    aria-current={active === i ? "true" : undefined}
                    className="flex h-6 items-center"
                  >
                    <span
                      className={`ease-svr block h-1.5 rounded-full transition-all duration-500 ${
                        active === i ? "bg-primary w-7" : "bg-primary/25 w-1.5"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                disabled={active === COUNT - 1}
                aria-label="Next testimonial"
                className="border-line text-navy shadow-chip ease-svr hover:border-primary/30 hover:shadow-card inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white/80 backdrop-blur transition-all duration-500 disabled:opacity-40"
              >
                <ChevronRight />
              </button>
            </div>

            {testimonials.viewMore && (
              <Button
                href={testimonials.viewMore.href}
                variant="secondary"
                size="md"
                className="shadow-chip"
                iconAfter={<ArrowRight className="h-4 w-4" />}
              >
                {testimonials.viewMore.label}
              </Button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            Testimonial {active + 1} of {COUNT}
          </p>
        </div>
      </div>
    </section>
  );
}

function DeckCard({
  index,
  pos,
  active,
  t,
}: {
  index: number;
  pos: MotionValue<number>;
  active: boolean;
  t: (typeof items)[number];
}) {
  // d < 0: already seen (flies forward and away); d > 0: waiting behind.
  const d = useTransform(pos, (p) => index - p);
  const x = useTransform(d, (v) => (v < 0 ? `${v * 70}%` : `${v * 4}%`));
  const y = useTransform(d, (v) => (v < 0 ? v * -10 : v * -26));
  const z = useTransform(d, (v) => (v < 0 ? -v * 140 : -v * 120));
  const rotateY = useTransform(d, (v) => (v < 0 ? v * 22 : v * -4));
  const rotateZ = useTransform(d, (v) => (v < 0 ? v * 4 : 0));
  const opacity = useTransform(d, (v) =>
    v < 0 ? Math.max(0, 1 + v * 1.4) : Math.max(0, 1 - v * 0.28),
  );
  const zIndex = useTransform(d, (v) => Math.round(100 - Math.abs(v) * 10));

  return (
    <motion.figure
      style={{ x, y, z, rotateY, rotateZ, opacity, zIndex }}
      aria-hidden={!active}
      inert={!active}
      className="deck-card absolute inset-0 flex flex-col justify-between rounded-[var(--radius-card)] p-7 md:p-10"
    >
      <div>
        <div
          className="text-primary flex items-center gap-1"
          aria-label={`Rated ${t.rating} out of 5`}
          role="img"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < t.rating ? "" : "opacity-20"}`} />
          ))}
          <TodoBadge show={t.todo} />
        </div>
        <blockquote className="font-display text-navy mt-5 text-[clamp(1.15rem,1rem+0.8vw,1.6rem)] leading-snug font-medium tracking-[-0.015em]">
          “{t.quote}”
        </blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3.5">
        <span
          aria-hidden
          className="from-primary to-accent font-display shadow-chip flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white"
        >
          {t.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </span>
        <span>
          <span className="text-navy block font-semibold">{t.name}</span>
          <span className="text-muted block text-sm">
            {t.role}, {t.company}
          </span>
        </span>
      </figcaption>
    </motion.figure>
  );
}
