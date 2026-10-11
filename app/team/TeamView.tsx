"use client";

import { team } from "@/content/site";
import { FarLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  LinkedIn,
  Github,
  Mail,
} from "@/components/ui/icons";

export function TeamView() {
  return (
    <div className="relative">
      <FarLayer
        glows={[
          { x: "70%", y: "18%", size: 850, color: "rgb(59 130 246 / 0.16)" },
          { x: "15%", y: "50%", size: 750, color: "rgb(147 197 253 / 0.22)" },
          { x: "80%", y: "80%", size: 800, color: "rgb(29 78 216 / 0.1)" },
        ]}
      />

      <div className="container-site relative z-[1]">
        {/* Header */}
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">{team.eyebrow}</p>
            <h1 className="font-display text-display text-navy mt-4 font-semibold text-balance">
              {team.title}
            </h1>
            <p className="text-lead text-muted mt-5 leading-relaxed">
              {team.intro}
            </p>
          </Reveal>
        </div>

        {/* Studio Principles & Operating Values */}
        {team.values && team.values.length > 0 && (
          <Reveal className="mt-12 md:mt-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {team.values.map((v, i) => (
                <div
                  key={v.title}
                  className="border-line/70 glass rounded-2xl p-6 shadow-card backdrop-blur-md"
                >
                  <span className="text-primary font-display text-xs font-bold tracking-widest uppercase">
                    0{i + 1} · Principle
                  </span>
                  <h3 className="font-display text-h3 text-navy mt-2 text-lg font-semibold">
                    {v.title}
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Team Members Grid */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:mt-18 md:grid-cols-2 lg:gap-10">
          {team.members.map((member, i) => (
            <Reveal key={member.id || member.name} stagger={0.08 * i} className="h-full">
              <TiltCard className="ring-primary/10 flex h-full flex-col justify-between overflow-hidden rounded-[var(--radius-card)] ring-1">
                <div className="glass-fill flex flex-1 flex-col p-7 sm:p-8">
                  {/* Top: Avatar/Initials & Social Links */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="from-primary to-accent font-display shadow-card flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-base font-bold text-white">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="font-display text-h3 text-navy text-xl font-semibold">
                          {member.name}
                        </h2>
                        <p className="text-primary text-sm font-medium">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Socials */}
                    {member.social && (
                      <div className="flex items-center gap-1.5">
                        {member.social.linkedin && (
                          <a
                            href={member.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} LinkedIn`}
                            className="text-muted hover:text-primary rounded-lg p-2 transition-colors"
                          >
                            <LinkedIn className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.github && (
                          <a
                            href={member.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${member.name} GitHub`}
                            className="text-muted hover:text-primary rounded-lg p-2 transition-colors"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {member.social.email && (
                          <a
                            href={`mailto:${member.social.email}`}
                            aria-label={`Email ${member.name}`}
                            className="text-muted hover:text-primary rounded-lg p-2 transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata Chips: Focus & Experience */}
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {member.focus && (
                      <span className="border-line/80 bg-white/70 text-ink/80 rounded-full border px-3 py-1 font-medium">
                        Focus: {member.focus}
                      </span>
                    )}
                    {member.experience && (
                      <span className="border-primary/20 bg-bg-tint text-primary rounded-full border px-3 py-1 font-semibold">
                        {member.experience} Experience
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-muted mt-4 text-[0.9375rem] leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Impact block */}
                  {member.impact && (
                    <div className="border-line/70 mt-6 rounded-2xl border bg-white/40 p-4 backdrop-blur-sm">
                      <span className="text-muted block text-[11px] font-bold tracking-[0.1em] uppercase">
                        Track Record & Impact
                      </span>
                      <p className="text-navy mt-1 text-sm font-medium leading-normal">
                        {member.impact}
                      </p>
                    </div>
                  )}

                  {/* Skills tags */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-1.5 pt-2">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="border-line/70 bg-white/80 text-ink/70 rounded-md border px-2.5 py-1 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA block */}
        <Reveal className="mt-20 md:mt-28">
          <div className="border-primary/15 relative overflow-hidden rounded-[var(--radius-card)] border bg-white/80 p-8 shadow-card md:p-12">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="font-display text-h2 text-navy font-semibold">
                  Partner directly with senior engineers.
                </h3>
                <p className="text-muted mt-2 max-w-[50ch] text-base">
                  No junior handoffs or opaque communication. Work side-by-side with engineers who take ownership.
                </p>
              </div>
              <Button href="/#contact" size="lg" iconAfter={<ArrowRight className="h-4 w-4" />}>
                Start a Conversation
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
