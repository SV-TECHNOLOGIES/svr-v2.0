import { footer, nav, site } from "@/content/site";
import { Logo } from "@/components/ui/Logo";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { ScrollLink } from "@/components/ui/ScrollLink";
import { Instagram, LinkedIn, Mail, Phone, WhatsApp } from "@/components/ui/icons";

const SOCIAL_ICONS = { linkedin: LinkedIn, instagram: Instagram };

/**
 * Footer — lattice stage 10: deep navy; the lattice dissolves into faint
 * glowing points. Content rises with layered parallax.
 */
export function Footer() {
  return (
    <footer data-lattice-stage="10" className="relative overflow-hidden text-white/80">
      {/* navy base + far layer (both below the canvas) */}
      <div aria-hidden className="bg-navy absolute inset-0 z-0" />
      <FarLayer
        dark
        speed={0.25}
        glows={[
          { x: "15%", y: "10%", size: 760, color: "rgb(59 130 246 / 0.28)" },
          { x: "88%", y: "90%", size: 680, color: "rgb(29 78 216 / 0.4)" },
        ]}
      />
      <div
        aria-hidden
        className="via-accent/60 pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent to-transparent"
      />
      <div
        data-lattice-anchor="footer-stage"
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />

      <ParallaxLayer speed={-0.12} className="layer-near">
        <div className="container-site pt-20 pb-10 md:pt-28">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <Logo tone="light" />
              <p className="font-display text-h2 mt-6 font-semibold text-white">{footer.tagline}</p>
              <p className="mt-4 max-w-[42ch] text-white/65">{footer.blurb}</p>
            </div>

            <nav aria-label="Footer" className="md:col-span-3 md:col-start-7">
              <p className="text-glow text-xs font-semibold tracking-[0.14em] uppercase">Explore</p>
              <ul className="mt-5 flex flex-col gap-3">
                {nav.links.map((l) => (
                  <li key={l.href}>
                    <ScrollLink
                      href={l.href}
                      className="ease-svr text-white/75 transition-colors duration-500 hover:text-white"
                    >
                      {l.label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-3">
              <p className="text-glow text-xs font-semibold tracking-[0.14em] uppercase">Contact</p>
              <ul className="mt-5 flex flex-col gap-3">
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="inline-flex items-center gap-2 break-all text-white/75 hover:text-white"
                  >
                    <Mail className="text-glow h-4 w-4 shrink-0" />
                    {site.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={site.contact.phoneHref}
                    className="inline-flex items-center gap-2 text-white/75 hover:text-white"
                  >
                    <Phone className="text-glow h-4 w-4" />
                    {site.contact.phone}
                  </a>
                </li>
                {site.contact.whatsappHref && (
                  <li>
                    <a
                      href={site.contact.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                    >
                      <WhatsApp className="h-4 w-4 fill-current" />
                      WhatsApp Chat
                    </a>
                  </li>
                )}
                <li className="text-white/65">{site.contact.location}</li>
              </ul>
              <ul className="mt-6 flex gap-3">
                {site.social.map((s) => {
                  const Icon = SOCIAL_ICONS[s.icon];
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${site.name} on ${s.label} (opens in a new tab)`}
                        className="ease-svr hover:border-glow/50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                      >
                        <Icon />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>{footer.copyright}</p>
            <p>{site.positioning}</p>
          </div>
        </div>
      </ParallaxLayer>
    </footer>
  );
}
