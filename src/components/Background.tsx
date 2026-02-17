"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const expo = [0.16, 1, 0.3, 1] as const;

const experiences = [
  {
    company: "YouWoAI",
    role: "AI Infrastructure Engineer",
    type: "Founding Engineer",
    period: "Jul 2025 — Present",
    description:
      "Designed large-scale LLM system architecture where retrieval, orchestration, and evaluation are co-designed to improve accuracy and reliability in real-world usage.",
  },
  {
    company: "University of Toronto",
    role: "Researcher · Backend Engineer · TA",
    type: "Part-time",
    period: "May 2025 — Present",
    description:
      "Researched AI-powered learning systems and ML-assisted GPU scheduling. Built auditable backend systems for healthcare AI (Remeda.ai). TA for Software Engineering.",
  },
  {
    company: "Siemens Healthineers",
    role: "Database Engineer",
    type: "Internship",
    period: "Jul — Sep 2023",
    description:
      "Worked on database management systems and optimized data workflows at a global healthcare technology company.",
  },
];

const education = {
  school: "University of Toronto",
  degree: "Honours Bachelor of Science",
  major: "Computer Science Specialist",
  period: "2023 — 2027",
  gpa: "4.0",
};

export default function Background() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-10">Background</p>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* Experience — left column */}
          <div className="flex flex-col gap-4">
            <ScrollReveal delay={0.05}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
                Experience
              </p>
            </ScrollReveal>
            {experiences.map((exp, i) => (
              <ScrollReveal key={exp.company} delay={0.1 + i * 0.08}>
                <motion.div
                  className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:bg-surface-hover"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, ease: expo }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                      {exp.company}
                    </h3>
                    <span className="font-mono text-xs text-muted whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {exp.role}
                    <span className="mx-2 text-border">·</span>
                    {exp.type}
                  </p>
                  <p className="mt-3 text-sm text-muted/80 leading-relaxed">
                    {exp.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Education — right column, sticky */}
          <div>
            <ScrollReveal delay={0.15}>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
                Education
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="lg:sticky lg:top-28">
                <motion.div
                  className="group rounded-xl border border-border bg-surface p-6 transition-colors hover:bg-surface-hover"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, ease: expo }}
                >
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent">
                    {education.school}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {education.degree}
                  </p>
                  <p className="text-sm text-muted">
                    {education.major}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-muted">
                      {education.period}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      GPA {education.gpa}
                    </span>
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
