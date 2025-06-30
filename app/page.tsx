import Hero from "./components/Hero";
import Partners from "./components/Partners";
import Problem from "./components/Problem";
import Benefits from "./components/Benefits";
import Gallery from "./components/Gallery";
import HowItWorks from "./components/HowItWorks";
import Faq from "./components/Faq";

export default function Page() {
  return (
    <>
      <Hero />
      <Partners />
      <Problem />
      <section id="benefits">
        <Benefits />
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="gallery">
        <Gallery />
      </section>
      <section id="faq">
        <Faq />
      </section>
    </>
  );
}
