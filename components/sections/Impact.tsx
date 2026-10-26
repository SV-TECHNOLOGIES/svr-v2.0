
import { impact } from "@/content/site";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { TodoBadge } from "@/components/ui/TodoBadge";

/**
 * Impact — temporarily hidden.
 *
 * To restore this section in the future:
 * 1. Change SHOW_IMPACT to true.
 * 2. The original section implementation is preserved below.
 */

const SHOW_IMPACT = false;

export function Impact() {
  if (!SHOW_IMPACT) {
    return null;
  }

  return <ImpactContent />;
}

/**
 * Original Impact section.
 * Preserved so it can be restored when impact metrics are confirmed.
 */
function ImpactContent() {
  const depths = [0.1, 0.18, 0.06, 0.14];

  return (
    <section
      id="impact"
      aria-labelledby="impact-title"
      data-lattice-stage="6"
      className="relative py-28 md:py-40"
    >
      <FarLayer
        glows={[
          {
            x: "20%",
            y: "35%",
            size: 820,
            color: "rgb(59 130 246 / 0.14)",
          },
          {
            x: "85%",
            y: "70%",
            size: 700,
            color: "rgb(147 197 253 / 0.25)",
          },
        ]}
      />

      <div className="container-site layer-near">
        <Reveal className="max-w-3xl">
          <SectionHeading
            eyebrow={impact.eyebrow}
            title={impact.title}
            id="impact-title"
          />
        </Reveal>

        <div data-lattice-anchor="impact-stage" className="relative">
          <Reveal
            as="ul"
            className="mt-14 grid grid-cols-2 gap-4 md:mt-20 md:gap-6 lg:grid-cols-4"
            stagger={0.1}
          >
            {impact.stats.map((s, i) => (
              <li
                key={s.label}
                className={i % 2 === 1 ? "lg:translate-y-10" : ""}
              >
                <ParallaxLayer speed={depths[i]}>
                  <div className="cursor-tilt">
                    <div className="glass shadow-card relative rounded-[var(--radius-card)] p-5 md:p-7">
                      <span
                        aria-hidden
                        data-lattice-anchor={`impact-stat-${i}`}
                        className="border-primary/30 shadow-chip absolute -top-2 -right-2 h-4 w-4 rounded-full border bg-white/80"
                      />

                      <p className="font-display text-navy text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] leading-none font-semibold tracking-[-0.04em]">
                        <CountUp value={s.value} suffix={s.suffix} />
                      </p>

                      <p className="text-muted mt-3 text-[0.9375rem] font-medium">
                        {s.label}
                        <TodoBadge show={s.todo} />
                      </p>

                      <span
                        aria-hidden
                        className="from-primary/40 via-accent/20 mt-5 block h-px w-full bg-gradient-to-r to-transparent"
                      />
                    </div>
                  </div>
                </ParallaxLayer>
              </li>
            ))}
          </Reveal>

          <Reveal className="mt-16 md:mt-24">
            <p className="font-display text-h2 text-navy mx-auto max-w-[46ch] text-center font-medium text-balance">
              {impact.outcome.split(":")[0]}:
              <span className="text-gradient">
                {" "}
                {impact.outcome.split(":")[1]}
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
