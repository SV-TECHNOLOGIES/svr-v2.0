import { Navbar } from "@/components/sections/Navbar";
import { DigitalMarketingServices } from "@/components/sections/DigitalMarketingServices";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function DigitalMarketingPage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <DigitalMarketingServices />
        <Contact />
      </main>
      <Footer />
    </>
  );
}