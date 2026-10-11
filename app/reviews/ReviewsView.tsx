"use client";

import { reviews } from "@/content/site";
import { FarLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { Star, Check, ArrowRight } from "@/components/ui/icons";

export function ReviewsView() {
  return (
    <div className="relative">
      <FarLayer
        glows={[
          { x: "35%", y: "15%", size: 850, color: "rgb(59 130 246 / 0.18)" },
          { x: "85%", y: "45%", size: 900, color: "rgb(147 197 253 / 0.2)" },
          { x: "25%", y: "85%", size: 700, color: "rgb(29 78 216 / 0.1)" },
        ]}
      />

      <div className="container-site relative z-[1]">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">{reviews.eyebrow}</p>
            <h1 className="font-display text-display text-navy mt-4 font-semibold text-balance">
              {reviews.title}
            </h1>
            <p className="text-lead text-muted mt-5 leading-relaxed">
              {reviews.intro}
            </p>
          </Reveal>
        </div>

        {/* Rating Score & Key Highlights Bar */}
        <Reveal className="mt-12 md:mt-16">
          <div className="border-primary/15 grid grid-cols-2 gap-6 rounded-[var(--radius-card)] border bg-white/70 p-6 shadow-card backdrop-blur-md sm:grid-cols-4 md:p-8">
            <div className="flex flex-col justify-center border-r border-line/60 pr-4">
              <div className="flex items-center gap-2">
                <span className="font-display text-display text-navy font-bold leading-none">
                  {reviews.averageRating}
                </span>
                <div className="flex flex-col">
                  <div className="text-primary flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-muted mt-0.5 text-xs">
                    {reviews.totalReviews} verified reviews
                  </span>
                </div>
              </div>
            </div>

            {reviews.highlights &&
              reviews.highlights.map((h, idx) => (
                <div
                  key={h.label}
                  className={`flex flex-col justify-center ${
                    idx < reviews.highlights.length - 1 ? "sm:border-r sm:border-line/60 sm:pr-4" : ""
                  }`}
                >
                  <span className="font-display text-h2 text-gradient font-bold leading-none">
                    {h.value}
                  </span>
                  <span className="text-muted mt-1 text-xs font-semibold tracking-wide uppercase">
                    {h.label}
                  </span>
                </div>
              ))}
          </div>
        </Reveal>

        {/* Reviews Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {reviews.items.map((item, i) => (
            <Reveal key={item.id || item.name + i} stagger={0.06 * i} className="h-full">
              <TiltCard className="ring-primary/10 flex h-full flex-col justify-between overflow-hidden rounded-[var(--radius-card)] ring-1">
                <div className="glass-fill flex flex-1 flex-col justify-between p-6 sm:p-7">
                  <div>
                    {/* Stars & Verified pill */}
                    <div className="flex items-center justify-between">
                      <div className="text-primary flex items-center gap-0.5" role="img" aria-label={`Rated ${item.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <Star
                            key={starIndex}
                            className={`h-4 w-4 ${
                              starIndex < (item.rating ?? 5) ? "fill-current" : "opacity-25"
                            }`}
                          />
                        ))}
                      </div>

                      {item.verified !== false && (
                        <span className="border-line/70 inline-flex items-center gap-1 rounded-full border bg-white/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 shadow-2xs">
                          <Check className="h-3 w-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Quote */}
                    <blockquote className="font-display text-navy mt-5 text-[1.05rem] leading-snug font-medium">
                      “{item.quote}”
                    </blockquote>

                    {/* Project & Date attribution */}
                    {(item.project || item.date) && (
                      <div className="border-line/60 mt-4 border-t pt-3 text-xs text-muted/80">
                        {item.project && <span className="font-medium text-ink/80">{item.project}</span>}
                        {item.project && item.date && <span> · </span>}
                        {item.date && <span>{item.date}</span>}
                      </div>
                    )}
                  </div>

                  {/* Author footer */}
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4">
                    <div className="from-primary to-accent font-display shadow-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white">
                      {item.avatar ||
                        item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-navy block truncate text-sm font-semibold">
                        {item.name}
                      </span>
                      {(item.role || item.company) && (
                        <span className="text-muted block truncate text-xs">
                          {item.role}
                          {item.role && item.company && ", "}
                          {item.company}
                        </span>
                      )}
                    </div>
                  </figcaption>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Bottom review guarantee banner */}
        <Reveal className="mt-16 md:mt-24">
          <div className="border-primary/15 relative overflow-hidden rounded-[var(--radius-card)] border bg-white/80 p-8 shadow-card md:p-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="text-glow text-xs font-semibold tracking-wider uppercase">
                  Our Engineering Guarantee
                </span>
                <h3 className="font-display text-h2 text-navy mt-2 font-semibold">
                  Transparent milestones. No surprise invoices.
                </h3>
                <p className="text-muted mt-2 max-w-[54ch] text-base">
                  Weekly production deployments with direct engineer code walkthroughs. You retain 100% intellectual property ownership from sprint one.
                </p>
              </div>
              <Button href="/#contact" size="lg" iconAfter={<ArrowRight className="h-4 w-4" />}>
                Start Your Project
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
