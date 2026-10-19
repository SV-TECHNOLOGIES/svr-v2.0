import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Impact } from "@/components/sections/Impact";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { DigitalMarketingServices } from "@/components/sections/DigitalMarketingServices";

/**
 * Home. Section order follows the lattice story:
 * idea → process → impact → services → testimonials → contact → footer.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
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
