"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const expo = [0.16, 1, 0.3, 1] as const;

type Experience = {
  company: string;
  url: string;
  role: string;
  type: string;
  period: string;
  highlights: string[];
};

const experiences: Experience[] = [
  {
    company: "IBM",
    url: "https://www.ibm.com",
    role: "AI Engineer",
    type: "Internship",
    period: "May 2026 — Present",
    highlights: [
      "On the watsonx Context Manager team, building and testing the RAG system powering IBM's products at enterprise scale.",
      "Own retrieval pipelines end-to-end, from ingestion to ranking.",
      "Build evaluation harnesses to keep responses accurate and reliable.",
    ],
  },
  {
    company: "Vector Institute",
    url: "https://vectorinstitute.ai",
    role: "Research Assistant",
    type: "Research Contract",
    period: "Jan — Apr 2026",
    highlights: [
      "Built a coupled speech–language pipeline where LLMs and ASR models interact.",
      "Models iteratively refine each other to improve transcription quality.",
      "Raised semantic consistency across the combined system.",
    ],
  },
  {
    company: "YouWoAI",
    url: "https://youwo.ai",
    role: "AI Infrastructure Engineer",
    type: "Founding Engineer",
    period: "Jul 2025 — Present",
    highlights: [
      "Designed large-scale LLM system architecture as a founding engineer.",
      "Co-designed retrieval, orchestration, and evaluation as one system.",
      "Tuned the architecture for accuracy and reliability in real-world usage.",
    ],
  },
  {
    company: "University of Toronto",
    url: "https://www.utoronto.ca",
    role: "Researcher · TA",
    type: "Part-time",
    period: "May 2025 — Present",
    highlights: [
      "Researched AI-powered learning systems and ML-assisted GPU scheduling.",
      "Built auditable backend systems for healthcare AI (Remeda.ai).",
      "TA for Software Engineering.",
    ],
  },
  {
    company: "Siemens Healthineers",
    url: "https://www.siemens-healthineers.com",
    role: "Database Engineer",
    type: "Internship",
    period: "Jul — Sep 2023",
    highlights: [
      "Worked on database management systems at a global healthcare technology company.",
      "Optimized data workflows for scale and reliability.",
    ],
  },
];

const education = {
  school: "University of Toronto",
  degree: "Honours Bachelor of Science",
  major: "Double Major in Computer Science & Statistics",
  period: "2023 — 2027",
  gpa: "4.0",
};

function ExperienceTabs() {
  const [active, setActive] = useState(0);
  const exp = experiences[active];

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-[11rem_1fr] sm:gap-16">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Experience"
        className="relative flex flex-row overflow-x-auto pb-px sm:flex-col sm:overflow-visible sm:pb-0"
      >
        {/* Track line */}
        <div className="absolute bottom-0 left-0 right-0 top-auto h-px bg-border sm:bottom-0 sm:right-auto sm:top-0 sm:h-auto sm:w-px" />

        {experiences.map((e, i) => {
          const isActive = i === active;
          return (
            <button
              key={e.company}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={`group relative flex cursor-pointer items-baseline gap-3 whitespace-nowrap rounded-md px-4 py-3 text-left transition-colors duration-300 sm:rounded-l-none sm:rounded-r-md ${
                isActive ? "bg-surface/70 text-accent" : "text-muted/70 hover:bg-surface/50 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-bar"
                  className="absolute bottom-0 left-0 right-0 top-auto h-[2px] bg-accent sm:bottom-0 sm:right-auto sm:top-0 sm:h-auto sm:w-[2px]"
                  transition={{ duration: 0.35, ease: expo }}
                />
              )}
              <span
                className={`font-mono text-[0.65rem] tabular-nums transition-colors ${
                  isActive ? "text-accent" : "text-muted/40 group-hover:text-muted/70"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[0.8125rem]">{e.company}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exp.company}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: expo }}
          className="min-h-[18rem]"
        >
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {exp.role}{" "}
            <a
              href={exp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent decoration-accent/40 underline-offset-4 transition-colors hover:underline"
            >
              @ {exp.company}
            </a>
          </h3>
          <p className="mt-2 font-mono text-xs text-muted">
            {exp.type}
            <span className="mx-2 text-border">·</span>
            {exp.period}
          </p>

          <ul className="mt-8 space-y-5">
            {exp.highlights.map((h, hi) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.08 + hi * 0.06, ease: expo }}
                className="flex gap-4 text-base leading-relaxed text-muted"
              >
                <span className="mt-1 flex-none text-accent">▸</span>
                {h}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EducationStrip() {
  return (
    <ScrollReveal delay={0.1}>
      <div className="mt-8">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          Education
        </p>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-lg font-medium text-foreground">
            {education.school}
          </h3>
          <span className="font-mono text-xs text-muted">
            {education.period}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {education.degree}
          <span className="mx-2 text-border">·</span>
          {education.major}
          <span className="mx-2 text-border">·</span>
          GPA {education.gpa}
        </p>
      </div>
    </ScrollReveal>
  );
}

export default function Background() {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="mb-3 font-mono text-sm text-accent">Background</p>
        </ScrollReveal>

        <EducationStrip />

        <ScrollReveal delay={0.1}>
          <h2 className="mt-20 border-t border-border pt-10 text-3xl font-medium tracking-tight md:text-4xl">
            Where I&apos;ve worked
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <ExperienceTabs />
        </ScrollReveal>
      </div>
    </section>
  );
}
