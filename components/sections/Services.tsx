
import Link from "next/link";
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
  ArrowRight,
} from "lucide-react";

type ServicesProps = {
  limit?: number;
  showViewAll?: boolean;
};

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

export function Services({
  limit,
  showViewAll = false,
}: ServicesProps) {
  // Spread readonly JSON-configured items into a normal array.
  const allServices = [
    ...services.items.map((service) => ({
      ...service,
      tags: [...service.tags],
    })),
    ...additionalServices,
  ];

  const visibleServices =
    limit === undefined
      ? allServices
      : allServices.slice(0, Math.max(0, limit));

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      data-lattice-stage="7"
      className="relative py-20 md:py-28"
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
        aria-hidden="true"
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
            className="mt-12 grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.1}
          >
          {visibleServices.map((service, i) => {
            const Icon = serviceIcons[i % serviceIcons.length];

            return (
              <li key={`${service.title}-${i}`} className="h-full">
                <TiltCard className="ring-primary/10 flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 shadow-lg">
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

                  <div
                    className="glass-fill flex flex-1 flex-col p-6"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <h3 className="depth-1 font-display text-h3 text-navy text-center font-semibold">
                      {service.title}
                    </h3>

                    <p className="depth-1 text-muted mt-4 text-center text-[0.9375rem] leading-relaxed">
                      {service.body}
                    </p>

                    <ul
                      className="depth-2 mt-5 flex flex-1 flex-col gap-2.5"
                      aria-label={`${service.title} capabilities`}
                    >
                      {service.tags.map((tag) => (
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
                      href="/#contact"
                      className="mt-7 inline-flex items-center justify-center gap-3 rounded-lg border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      Learn More
                      <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </TiltCard>
              </li>
            );
          })}
        </Reveal>

        {showViewAll && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
            >
              View All Services
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
