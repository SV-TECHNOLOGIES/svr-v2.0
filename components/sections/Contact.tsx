import { contact, site } from "@/content/site";
import { FarLayer, ParallaxLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { TodoBadge } from "@/components/ui/TodoBadge";
import { Clock, Mail, MapPin, Phone, WhatsApp } from "@/components/ui/icons";
import { ContactForm } from "./ContactForm";

/**
 * Contact — lattice stage 9: one small, calm structure beside the form
 * ("your project is next"). On a successful submit it assembles fully.
 */
export function Contact() {
  const details = [
    { icon: Mail, label: "Email", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: Phone, label: "Phone", value: site.contact.phone, href: site.contact.phoneHref },
    ...(site.contact.whatsapp && site.contact.whatsappHref
      ? [{ icon: WhatsApp, label: "WhatsApp", value: site.contact.whatsapp, href: site.contact.whatsappHref }]
      : []),
    { icon: MapPin, label: "Location", value: site.contact.location },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-lattice-stage="9"
      className="relative py-28 md:py-36"
    >
      <FarLayer
        glows={[
          { x: "78%", y: "30%", size: 900, color: "rgb(59 130 246 / 0.14)" },
          { x: "15%", y: "80%", size: 700, color: "rgb(147 197 253 / 0.24)" },
        ]}
      />
      <div
        data-lattice-anchor="contact-section"
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />

      <div className="container-site layer-near grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading
              eyebrow={contact.eyebrow}
              title={contact.title}
              intro={contact.intro}
              id="contact-title"
            />
          </Reveal>
          <Reveal className="mt-10" self>
            <div className="glass shadow-card rounded-[var(--radius-card)] p-5 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-5 lg:pt-6" aria-label="Contact details">
          {/* lattice stage: the small structure lives here */}
          <ParallaxLayer speed={0.1} className="relative h-64 sm:h-80">
            <div data-lattice-anchor="contact-stage" aria-hidden className="absolute inset-0" />
            <p className="border-line text-muted shadow-chip absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border bg-white/80 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
              {contact.stageCaption}
            </p>
          </ParallaxLayer>

          <Reveal self>
            <TiltCard className="glass p-6 sm:p-8" max={5}>
              <ul className="flex flex-col gap-5">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="depth-1 flex items-start gap-4">
                    <span className="bg-bg-tint text-primary ring-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="text-muted block text-xs font-semibold tracking-[0.12em] uppercase">
                        {label}
                      </span>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-navy hover:text-primary mt-0.5 block font-medium break-words underline-offset-4 hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        <span className="text-navy mt-0.5 block font-medium">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Direct WhatsApp Action Button */}
              {site.contact.whatsappHref && (
                <div className="depth-1 mt-6 border-t border-line/70 pt-5">
                  <a
                    href={site.contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ease-svr hover:shadow-card flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#20ba5a] hover:-translate-y-0.5"
                  >
                    <WhatsApp className="h-4.5 w-4.5 fill-current" />
                    Chat with us on WhatsApp
                  </a>
                </div>
              )}

              <p className="depth-1 border-line text-muted mt-5 flex items-center gap-2.5 border-t pt-4 text-sm">
                <Clock className="text-primary h-4 w-4" />
                {site.contact.replyTime}
                <TodoBadge show={site.contact.replyTimeTodo} />
              </p>
            </TiltCard>
          </Reveal>
        </aside>
      </div>
    </section>
  );
}
