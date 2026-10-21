import { DigitalMarketingServices } from "@/components/sections/DigitalMarketingServices";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Impact } from "@/components/sections/Impact";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { testimonials } from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <SelectedWork />
        <Process />
        <Impact />
        <Services />
        <DigitalMarketingServices />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
