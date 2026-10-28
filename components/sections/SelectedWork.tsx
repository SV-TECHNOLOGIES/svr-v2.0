
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { portfolio } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

export function SelectedWork() {
  const mitra = portfolio.projects.find(
    (project) => project.id === "mitra",
  );

  if (!mitra) return null;

  return (
    <section
      id="selected-work"
      aria-labelledby="selected-work-title"
      className="relative py-20 md:py-28"
    >
      <div className="container-site">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Selected Work
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2
              id="selected-work-title"
              className="font-display max-w-2xl text-3xl font-bold tracking-tight text-navy md:text-4xl"
            >
              Real software, built for real organisations.
            </h2>

            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-75"
            >
              View all projects
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <article className="grid overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-lg md:grid-cols-2">
            <div className="flex min-h-64 flex-col justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-indigo-700 p-8 text-white md:min-h-80 md:p-12">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                Featured Project
              </span>

              <h3 className="mt-5 font-display text-3xl font-bold md:text-4xl">
                {mitra.title}
              </h3>

              <p className="mt-4 max-w-lg leading-relaxed text-blue-100">
                {mitra.client}
              </p>

              {mitra.link && (
                <a
                  href={mitra.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
                >
                  Visit live project
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              )}
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="leading-relaxed text-slate-600">
                {mitra.description}
              </p>

              {mitra.impact && (
                <div className="mt-7 rounded-xl bg-blue-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Project Impact
                  </p>

                  <p className="mt-2 font-semibold leading-relaxed text-slate-900">
                    {mitra.impact}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-2">
                {mitra.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="/portfolio"
                className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:opacity-75"
              >
                Explore our work
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
