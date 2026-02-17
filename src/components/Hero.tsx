"use client";

import { motion } from "framer-motion";

const expo = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-[95vh] items-center px-6 pt-40 pb-24">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] h-[400px] w-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[300px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Profile line art */}
      <motion.div
        className="absolute right-[5%] top-1/2 -translate-y-1/2 -z-[5] hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 2, delay: 0.8, ease: expo }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pic-lines.svg"
          alt=""
          aria-hidden="true"
          className="hero-line-art h-[600px] w-auto select-none pointer-events-none"
          draggable={false}
        />
      </motion.div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <ScrollReveal>
              <span className="technical-label mb-4 block">
                AI Infrastructure Engineer
              </span>
            </ScrollReveal>

            <motion.div className="h-6" /> {/* Vertical spacer */}

            <motion.h1
              className="text-foreground flex flex-wrap items-baseline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: expo }}
            >
              <span className="name-august">August Zheng</span>
            </motion.h1>

            <motion.div
              className="mt-12 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: expo }}
            >
              <h2 className="tagline-text font-medium">
                Toward world-class <span className="text-accent italic">AI systems.</span>
              </h2>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg">
                Engineering the infrastructure for reliable intelligence.
                Focusing on performance, scalability, and system integrity.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5, ease: expo }}
        >
          <div className="flex items-center gap-4 text-muted/40 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="h-px w-12 bg-border" />
            <span>Based in Toronto</span>
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span>Available for collaboration</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: expo }}
    >
      {children}
    </motion.div>
  );
}
