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
            Useful first. <span className="italic">Reliable always.</span>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="mt-8 max-w-xl text-muted text-xl leading-relaxed">
            The AI world doesn&apos;t need another demo. I build systems meant
            to be used: ones that solve a real problem, cite their sources,
            and behave the same on the thousandth request as on the first.
            Currently at IBM watsonx; previously Vector Institute, and a
            founding role at YouWoAI.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
