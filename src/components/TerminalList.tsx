"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/projects";

const expo = [0.16, 1, 0.3, 1] as const;

interface TerminalListProps {
  projects: Project[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function TerminalList({ projects }: TerminalListProps) {
  return (
    <motion.div
      className="overflow-hidden rounded-xl border border-border bg-[#0a0a0a]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: expo }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-muted font-mono">~/projects</span>
      </div>

      {/* Prompt line */}
      <div className="px-4 pt-3 pb-1 font-mono text-sm text-muted">
        <span className="text-accent">$</span> ls -la --sort=date
      </div>

      {/* Project rows */}
      <div className="px-2 pb-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.4,
              delay: 0.05 * i,
              ease: expo,
            }}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="group flex items-baseline gap-0 font-mono text-sm rounded-md px-2 py-1.5 transition-colors hover:bg-[#111]"
            >
              <span className="text-muted shrink-0 w-16 hidden sm:inline-block">
                drwxr
              </span>
              <span className="text-muted shrink-0 w-24">
                {formatDate(project.date)}
              </span>
              <span className="text-foreground font-medium shrink-0 w-44 truncate transition-colors group-hover:text-accent">
                {project.slug}
              </span>
              <span className="text-[#555] truncate hidden md:inline">
                {project.description}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Prompt cursor */}
      <div className="px-4 pb-3 font-mono text-sm text-muted">
        <span className="text-accent">$</span>
        <motion.span
          className="inline-block w-2 h-4 bg-accent/70 ml-1 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
    </motion.div>
  );
}
