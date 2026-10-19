
import {
  Megaphone,
  Search,
  FileText,
  MousePointer2,
  Share2,
  Mail,
  ChartNoAxesColumn,
  Star,
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

export function DigitalMarketingServices() {
  return (
    <section
      id="digital-marketing"
      aria-labelledby="digital-marketing-title"
      className="bg-[#eef4ff] px-5 py-20 sm:px-8 md:py-24"
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
            comprehensive marketing solutions
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {marketingServices.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="min-h-[250px] rounded-xl bg-white p-7 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[11px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
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
      </div>
    </section>
  );
}
