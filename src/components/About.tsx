import ScrollReveal from "./ScrollReveal";

export default function About() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-4">About</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl max-w-3xl leading-[1.15]">
            Architecting the foundations of <span className="italic font-serif">modern intelligence.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="mt-8 max-w-xl text-muted text-xl leading-relaxed">
            I specialize in building reliable AI infrastructure and high-performance systems.
            My work bridges the gap between complex research and production-grade reliability,
            ensuring that intelligence scales without compromise.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
