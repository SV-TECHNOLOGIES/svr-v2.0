
import { Navbar } from "@/components/sections/Navbar";
import { Services } from "@/components/sections/Services";
import { DigitalMarketingServices } from "@/components/sections/DigitalMarketingServices";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main id="main" tabIndex={-1}>
        <section className="pt-24 pb-10 text-center">
          <div className="container mx-auto px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              What We Do
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Services Built Around Your Vision
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              From custom software and cloud solutions to digital marketing,
              we help businesses build, grow, and succeed with technology.
            </p>
          </div>
        </section>

        <Services />

        <DigitalMarketingServices />

        <Contact />
      </main>

      <Footer />
    </>
  );
}
