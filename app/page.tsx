
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Impact } from "@/components/sections/Impact";
import { DigitalMarketingServices } from "@/components/sections/DigitalMarketingServices";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main" tabIndex={-1}>
        <Hero />
        <SelectedWork />

        {/* Four featured services with a link to the full Services page */}
        <Services limit={4} showViewAll />

        {/* Compact workflow preview with all steps visible */}
        <Process compact showViewAll />

        <Impact />

        {/* Four featured marketing services with a link to all offerings */}
        <DigitalMarketingServices limit={4} showViewAll />

        <Testimonials />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
