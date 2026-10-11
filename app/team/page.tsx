import type { Metadata } from "next";
import { site } from "@/content/site";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { TeamView } from "./TeamView";

export const metadata: Metadata = {
  title: "Engineering Team & Technical Leadership | SVR Tech Groups",
  description:
    "Meet our core studio team of senior systems architects, mobile engineers, and AI practitioners based in Hyderabad.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: `Our Engineering Team | ${site.name}`,
    description:
      "Direct collaboration with senior engineers who design, test, and ship your production systems.",
    url: "/team",
  },
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-20 md:pt-36 md:pb-28">
        <TeamView />
      </main>
      <Footer />
    </>
  );
}
