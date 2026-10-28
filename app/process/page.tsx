
import { Navbar } from "@/components/sections/Navbar";
import { Process } from "@/components/sections/Process";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function ProcessPage() {
  return (
    <>
      <Navbar />

      <main id="main" tabIndex={-1}>
        <section className="pt-24 pb-8 text-center">
          <div className="container mx-auto px-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              How We Build
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              From Idea to Impact
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
              A transparent, collaborative process that transforms your
              vision into a reliable digital solution.
            </p>
          </div>
        </section>

        <Process />

        <Contact />
      </main>

      <Footer />
    </>
  );
}
