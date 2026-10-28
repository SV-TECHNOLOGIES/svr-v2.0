import { hero } from "@/content/site";
import strings from "@/strings.json";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { ArrowRight } from "@/components/ui/icons";
import { ScrollLink } from "@/components/ui/ScrollLink";
import { LatticeLoader } from "@/components/three/LatticeLoader";

/**
 * Hero — lattice stage 0 ("an idea"): loose glass nodes drifting on the right,
 * reacting to the cursor. Text reveals line by line from depth using pure CSS
 * so it paints immediately (fast LCP), before any JavaScript runs.
 */
export function Hero() {
  let line = 0;
  const delay = (extra = 0) => ({ "--d": `${80 + line++ * 110 + extra}ms` }) as React.CSSProperties;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      
      className="relative flex min-h-[100svh] items-center pt-24 pb-20 md:pt-28"
    >
      {/* far layer */}
      <FarLayer
        speed={0.4}
        glows={[
          { x: "78%", y: "42%", size: 900, color: "rgb(59 130 246 / 0.16)" },
          { x: "12%", y: "18%", size: 620, color: "rgb(147 197 253 / 0.22)" },
          { x: "40%", y: "100%", size: 700, color: "rgb(29 78 216 / 0.07)" },
        ]}
      />

      <div className="container-site layer-near grid w-full grid-cols-1 items-center gap-10 md:grid-cols-12">
        {/* near layer: copy */}
        <div className="md:col-span-7 lg:col-span-7">
          <h1 id="hero-title" className="font-display text-display text-navy mt-6 font-semibold">
            {hero.headline.map((parts, i) => (
              <span key={i} className="hero-reveal block text-balance" style={delay()}>
                {parts.map((p, j) =>
                  "highlight" in p && p.highlight ? (
                    <span key={j} className="text-gradient">
                      {p.text}
                    </span>
                  ) : (
                    <span key={j}>{p.text}</span>
                  ),
                )}
              </span>
            ))}
          </h1>
          <p className="hero-reveal text-lead text-muted mt-7 max-w-[54ch]" style={delay(60)}>
            {hero.subtext}
          </p>
          <div className="hero-reveal mt-9 flex flex-wrap items-center gap-3" style={delay(60)}>
            <Button
              href={hero.primaryCta.href}
              size="lg"
              iconAfter={<ArrowRight className="h-4 w-4" />}
            >
              {hero.primaryCta.label}
            </Button>
            <Button href={hero.secondaryCta.href} size="lg" variant="secondary">
              {hero.secondaryCta.label}
            </Button>
          </div>
          <ul
            aria-label={strings.hero.chipsAria}
            className="hero-reveal mt-10 flex flex-wrap gap-2"
            style={delay(60)}
          >
            {hero.chips.map((c) => (
              <li key={c}>
                <Chip>
                  <span
                    aria-hidden
                    className="from-primary to-glow h-1.5 w-1.5 rounded-full bg-gradient-to-br"
                  />
                  {c}
                </Chip>
              </li>
            ))}
          </ul>
        </div>

        {/* mid layer: the lattice lives here (WebGL canvas behind, anchored to this box) */}
        <div className="pointer-events-none relative h-[34svh] min-h-56 md:col-span-5 md:h-[min(68vh,620px)]">
          <ParallaxLayer speed={0.12} className="relative h-full w-full">
            <div data-lattice-anchor="hero-stage" className="absolute inset-0" />
            <LatticeLoader />
          </ParallaxLayer>
        </div>
      </div>

      {/* scroll hint */}
      <ScrollLink
        href="#process"
        aria-label={strings.hero.scrollHintAria}
        className="hero-reveal layer-near text-muted absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase sm:flex"
        style={{ "--d": "900ms" } as React.CSSProperties}
      >
        <span className="border-muted/40 relative flex h-9 w-5.5 justify-center rounded-full border pt-1.5">
          <span className="scroll-dot bg-primary h-1.5 w-1 rounded-full" />
        </span>
        {hero.scrollHint}
      </ScrollLink>
    </section>
  );
}
