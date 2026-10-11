import type { Metadata } from "next";
import { site } from "@/content/site";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { ReviewsView } from "./ReviewsView";

export const metadata: Metadata = {
  title: "Client Reviews & Verified Outcomes | SVR Tech Groups",
  description:
    "Read verified reviews, outcomes, and feedback from founders, CTOs, and operators who partnered with SVR Tech Groups for custom software, mobile apps, and AI automations.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: `Client Reviews & Feedback | ${site.name}`,
    description:
      "Verified client testimonials, project timelines, and business ROI delivered by our custom engineering studio.",
    url: "/reviews",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-screen pt-28 pb-20 md:pt-36 md:pb-28">
        <ReviewsView />
      </main>
      <Footer />
    </>
  );
}
