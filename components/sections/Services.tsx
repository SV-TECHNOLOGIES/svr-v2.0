
import { services } from "@/content/site";
import { FarLayer } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import {
  Code,
  Cloud,
  Smartphone,
  ChartNoAxesColumn,
  Shield,
  Database,
} from "lucide-react";

const additionalServices = [
  {
    title: "Web Development",
    body: "Custom web applications built with modern technologies to deliver fast, responsive, and engaging digital experiences.",
    tags: ["React / Next.js", "Node.js", "Full-stack", "Responsive Design"],
  },
  {
    title: "Cloud Solutions",
    body: "Scalable cloud infrastructure and migration services to improve performance, flexibility, and cost efficiency.",
    tags: ["AWS / Azure", "Serverless", "Auto-scaling", "Cost Optimization"],
  },
  {
    title: "Mobile Development",
    body: "Native and cross-platform mobile applications designed to provide seamless experiences across devices.",
    tags: ["iOS & Android", "React Native", "Flutter", "App Store Deployment"],
  },
  {
    title: "Data Analytics",
    body: "Business intelligence and data visualization solutions that turn your data into actionable insights.",
    tags: ["Data Warehousing", "Real-time Analytics", "Custom Dashboards", "ML Integration"],
  },
  {
    title: "Cybersecurity",
    body: "Comprehensive security solutions and auditing to help protect your systems, applications, and business data.",
    tags: ["Security Audits", "Penetration Testing", "Compliance", "Incident Response"],
  },
  {
    title: "Database Management",
    body: "Database design, optimization, and management to keep your data secure, reliable, and accessible.",
    tags: ["Database Design", "Performance Tuning", "Backup Strategies", "Migration Services"],
  },
];

const serviceIcons = [
  Code,
  Cloud,
  Smartphone,
  ChartNoAxesColumn,
  Shield,
  Database,
];

export function Services() {
  const allServices = [...services.items, ...additionalServices];

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      data-lattice-stage="7"
      className="relative py-28 md:py-40"
    >
      <FarLayer
        glows={[
          {
            x: "50%",
            y: "20%",
            size: 1000,
            color: "rgb(59 130 246 / 0.12)",
          },
          {
            x: "90%",
            y: "90%",
            size: 620,
            color: "rgb(147 197 253 / 0.24)",
          },
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
            <SectionHeading
              eyebrow={services.eyebrow}
              title={services.title}
              id="services-title"
            />
          </div>

          <p className="text-lead text-muted max-w-[36ch] md:text-right">
            {services.intro}
          </p>
        </Reveal>

        <Reveal
          as="ul"
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mt-20 lg:grid-cols-3"
          stagger={0.1}
        >
          {allServices.map((s, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];

            return (
              <li key={`${s.title}-${i}`} className="h-full">
                <TiltCard className="ring-primary/10 flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 shadow-lg">
                  {/* Service logo */}
                  <div className="flex justify-center pt-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <Icon
                        size={38}
                        strokeWidth={2}
                        className="text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Existing service card content */}
                  <div
                    className="glass-fill flex flex-1 flex-col p-6"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <h3 className="depth-1 font-display text-h3 text-navy text-center font-semibold">
                      {s.title}
                    </h3>

                    <p className="depth-1 text-muted mt-4 text-center text-[0.9375rem] leading-relaxed">
                      {s.body}
                    </p>

                    <ul
                      className="depth-2 mt-5 flex flex-1 flex-col gap-2.5"
                      aria-label={`${s.title} capabilities`}
                    >
                      {s.tags.map((tag) => (
                        <li
                          key={tag}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-5 w-5 shrink-0 text-green-500"
                            aria-hidden="true"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="m8 12 2.5 2.5L16 9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#contact"
                      className="mt-7 inline-flex items-center justify-center gap-3 rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      Learn More
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="m7 10 5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </TiltCard>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
