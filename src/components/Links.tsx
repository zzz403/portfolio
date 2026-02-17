"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const expo = [0.16, 1, 0.3, 1] as const;

const links = [
  { label: "GitHub", href: "https://github.com/zzz403" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/augustzheng/" },
  { label: "Email", href: "mailto:zhongze.zheng@mail.utoronto.ca" },
];

export default function Links() {
  return (
    <section id="contact" className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-4">Contact</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-2xl font-medium tracking-tight text-foreground max-w-md leading-snug">
            Open to interesting problems<br />
            <span className="text-muted">and the people solving them.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted transition-colors hover:text-foreground"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2, ease: expo }}
              >
                {link.label}
                <span className="ml-1 text-border">&#8599;</span>
              </motion.a>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
