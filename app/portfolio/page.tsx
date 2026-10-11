import type { Metadata } from "next";
import { site } from "@/content/site";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PortfolioView } from "./PortfolioView";

export const metadata: Metadata = {
  title: "Project Portfolio | Custom Web, Mobile & AI Systems",
  description:
    "Explore our featured production engineering projects across websites, mobile apps, autonomous AI agents, and enterprise workflow automations.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: `Project Portfolio | ${site.name}`,
    description:
      "Production systems engineered for measurable business impact. Explore scale, timelines, and verified client outcomes.",
    url: "/portfolio",
  },
};

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-20 md:pt-36 md:pb-28">
        <PortfolioView />
      </main>
      <Footer />
    </>
  );
}
