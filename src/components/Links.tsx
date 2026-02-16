"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

const links = [
  { label: "GitHub", href: "https://github.com/zzz403" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/augustzheng/" },
  { label: "Email", href: "mailto:zhongze.zheng@mail.utoronto.ca" },
];

export default function Links() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-6">Links</p>
        </ScrollReveal>
        <div className="flex flex-wrap gap-3">
          {links.map((link, i) => (
            <ScrollReveal key={link.label} delay={0.1 * i}>
              <motion.a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {link.label}
                <span className="text-muted">&#8599;</span>
              </motion.a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
