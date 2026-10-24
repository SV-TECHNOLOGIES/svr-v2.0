
import Link from "next/link";
import {
  Megaphone,
  Search,
  FileText,
  MousePointer2,
  Share2,
  Mail,
  ChartNoAxesColumn,
  Star,
  ArrowRight,
} from "lucide-react";

const marketingServices = [
  {
    title: "Brand Identity & Presence",
    description:
      "Build a strong, recognizable brand that resonates with your audience.",
    Icon: Megaphone,
  },
  {
    title: "SEO & Local SEO",
    description:
      "Rank higher on search engines and attract local customers effectively.",
    Icon: Search,
  },
  {
    title: "Content Marketing",
    description:
      "Engaging content that drives traffic and converts visitors into customers.",
    Icon: FileText,
  },
  {
    title: "Paid Ads",
    description:
      "Targeted campaigns on Google, Facebook, Instagram, and LinkedIn.",
    Icon: MousePointer2,
  },
  {
    title: "Social Media Marketing",
    description:
      "Grow your presence and engage audiences across all social platforms.",
    Icon: Share2,
  },
  {
    title: "Email & WhatsApp Marketing",
    description:
      "Direct communication channels to nurture leads and drive conversions.",
    Icon: Mail,
  },
  {
    title: "Analytics & Tracking",
    description:
      "Data-driven insights to measure performance and optimize campaigns.",
    Icon: ChartNoAxesColumn,
  },
  {
    title: "Reputation & Reviews",
    description:
      "Manage your online reputation and build trust through positive reviews.",
    Icon: Star,
  },
];

type DigitalMarketingServicesProps = {
  limit?: number;
  showViewAll?: boolean;
};

export function DigitalMarketingServices({
  limit,
  showViewAll = false,
}: DigitalMarketingServicesProps) {
  const visibleServices =
    limit === undefined
      ? marketingServices
      : marketingServices.slice(0, Math.max(0, limit));

  return (
    <section
      id="digital-marketing"
      aria-labelledby="digital-marketing-title"
      className="bg-[#eef4ff] px-5 py-16 sm:px-8 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="digital-marketing-title"
            className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-[44px]"
          >
            Digital Marketing Services
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
            At SVR TECH GROUPS, we help businesses grow digitally with
            comprehensive marketing solutions.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {visibleServices.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="flex min-h-[250px] flex-col rounded-xl bg-white p-7 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Icon size={27} strokeWidth={2} aria-hidden="true" />
              </div>

              <h3 className="mt-6 text-xl font-semibold leading-snug text-slate-950">
                {title}
              </h3>

              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              View All Digital Marketing Services
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
