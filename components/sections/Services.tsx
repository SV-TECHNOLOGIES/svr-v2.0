import { services } from "@/content/site";
import { FarLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";

/**
 * Services — lattice stage 7: the system splits into four clusters. Each one
 * drifts into the "window" at the top of a card and forms an abstract icon:
 * browser frame, phone frame, agent node, workflow chain.
 */
export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      data-lattice-stage="7"
      className="relative py-28 md:py-40"
    >
      <FarLayer
        glows={[
          { x: "50%", y: "20%", size: 1000, color: "rgb(59 130 246 / 0.12)" },
          { x: "90%", y: "90%", size: 620, color: "rgb(147 197 253 / 0.24)" },
        ]}
      />
      <div
        data-lattice-anchor="services-stage"
        className="pointer-events-none absolute inset-0"
        aria-hidden
      />

      <div className="container-site layer-near">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionHeading eyebrow={services.eyebrow} title={services.title} id="services-title" />
          </div>
          <p className="text-lead text-muted max-w-[36ch] md:text-right">{services.intro}</p>
        </Reveal>

        <Reveal
          as="ul"
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-4"
          stagger={0.1}
        >
          {services.items.map((s, i) => (
            <li key={s.title} className="h-full">
              <TiltCard className="ring-primary/10 flex h-full flex-col overflow-hidden ring-1">
                {/* window: the lattice icon cluster appears here */}
                <div className="border-primary/10 to-bg-tint/40 relative h-44 border-b bg-gradient-to-b from-white/30 md:h-48">
                  <div aria-hidden className="far-grid absolute inset-0 opacity-70" />
                  <div
                    data-lattice-anchor={`service-${i}`}
                    aria-hidden
                    className="absolute inset-4"
                  />
                  <span className="depth-2 font-display text-primary/70 absolute top-4 left-4 text-xs font-semibold tracking-[0.14em] tabular-nums">
                    0{i + 1}
                  </span>
                </div>
                <div
                  className="glass-fill flex flex-1 flex-col p-6"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <h3 className="depth-1 font-display text-h3 text-navy font-semibold">
                    {s.title}
                  </h3>
                  <p className="depth-1 text-muted mt-2.5 flex-1 text-[0.9375rem] leading-relaxed">
                    {s.body}
                  </p>
                  <ul
                    className="depth-2 mt-5 flex flex-wrap gap-1.5"
                    aria-label={`${s.title} capabilities`}
                  >
                    {s.tags.map((t) => (
                      <li
                        key={t}
                        className="border-primary/10 bg-bg-tint text-primary rounded-full border px-2.5 py-1 text-[0.75rem] font-medium"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
