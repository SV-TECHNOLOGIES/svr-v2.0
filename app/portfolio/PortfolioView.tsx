"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolio } from "@/content/site";
import { FarLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ExternalLink, Clock } from "@/components/ui/icons";
import { EASE } from "@/lib/constants";

export function PortfolioView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects =
    selectedCategory === "All"
      ? portfolio.projects
      : portfolio.projects.filter(
          (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
        );

  return (
    <div className="relative">
      {/* Background glow layers */}
      <FarLayer
        glows={[
          { x: "65%", y: "15%", size: 900, color: "rgb(59 130 246 / 0.16)" },
          { x: "20%", y: "45%", size: 750, color: "rgb(147 197 253 / 0.22)" },
          { x: "80%", y: "85%", size: 850, color: "rgb(29 78 216 / 0.12)" },
        ]}
      />

      <div className="container-site relative z-[1]">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">{portfolio.eyebrow}</p>
            <h1 className="font-display text-display text-navy mt-4 font-semibold text-balance">
              {portfolio.title}
            </h1>
            <p className="text-lead text-muted mt-5 leading-relaxed">
              {portfolio.intro}
            </p>
          </Reveal>
        </div>

        {/* Filter buttons */}
        {portfolio.filters && portfolio.filters.length > 0 && (
          <Reveal className="mt-12 md:mt-16">
            <div className="flex flex-wrap gap-2.5">
              {portfolio.filters.map((filter) => {
                const isActive = selectedCategory === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedCategory(filter)}
                    className={`ease-svr rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-white shadow-[0_6px_20px_-6px_rgb(29_78_216/0.6)]"
                        : "border-line text-ink/75 hover:border-primary/30 hover:text-navy bg-white/70 backdrop-blur"
                    } border`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Project grid */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-8 md:mt-12 md:grid-cols-2 lg:gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id || project.title}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                className="h-full"
              >
                <TiltCard className="ring-primary/10 flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] ring-1">
                  <div className="glass-fill flex flex-1 flex-col p-6 sm:p-8">
                    {/* Header: Category & Client */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {project.category && (
                          <span className="border-primary/20 bg-bg-tint text-primary rounded-full border px-3 py-1 text-xs font-semibold tracking-wide">
                            {project.category}
                          </span>
                        )}
                        {project.featured && (
                          <span className="from-primary to-accent rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[11px] font-semibold text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      {project.timeline && (
                        <span className="text-muted inline-flex items-center gap-1.5 text-xs font-medium">
                          <Clock className="text-primary h-3.5 w-3.5" />
                          {project.timeline}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-display text-h3 text-navy mt-4 font-semibold">
                      {project.title}
                    </h2>

                    {project.client && (
                      <p className="text-muted/80 mt-1 text-xs font-medium uppercase tracking-wider">
                        Client: {project.client}
                      </p>
                    )}

                    {/* Description */}
                    {project.description && (
                      <p className="text-muted mt-4 flex-1 text-[0.9375rem] leading-relaxed">
                        {project.description}
                      </p>
                    )}

                    {/* Details Box: Scale & Impact */}
                    {(project.scale || project.impact) && (
                      <div className="border-line/70 mt-6 space-y-3.5 rounded-2xl border bg-white/40 p-4.5 backdrop-blur-sm">
                        {project.scale && (
                          <div>
                            <span className="text-muted block text-[11px] font-bold tracking-[0.1em] uppercase">
                              Production Scale
                            </span>
                            <span className="text-navy mt-0.5 block text-sm font-semibold">
                              {project.scale}
                            </span>
                          </div>
                        )}

                        {project.impact && (
                          <div>
                            <span className="text-muted block text-[11px] font-bold tracking-[0.1em] uppercase">
                              Verified Impact
                            </span>
                            <span className="text-gradient mt-0.5 block text-sm font-semibold">
                              {project.impact}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border-line/80 bg-white/80 text-ink/75 rounded-md border px-2.5 py-1 text-xs font-medium shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Optional external link */}
                    {project.link && (
                      <div className="mt-6 pt-4 border-t border-line/60">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-navy inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                        >
                          View Live Experience <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA block */}
        <Reveal className="mt-20 md:mt-28">
          <div className="border-primary/15 relative overflow-hidden rounded-[var(--radius-card)] border bg-gradient-to-br from-white/90 via-white/80 to-blue-50/70 p-8 shadow-card md:p-12">
            <div className="relative z-[1] flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-h2 text-navy font-semibold">
                  Have a system you need built right?
                </h3>
                <p className="text-muted mt-2 max-w-[50ch] text-base">
                  We take early architecture through to verified deployment in weeks, not quarters.
                </p>
              </div>
              <Button href="/#contact" size="lg" iconAfter={<ArrowRight className="h-4 w-4" />}>
                Discuss Your Scope
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
