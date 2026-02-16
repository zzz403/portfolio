"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/projects";

const expo = [0.16, 1, 0.3, 1] as const;

interface CardStackPreviewProps {
  project: Project | null;
}

export default function CardStackPreview({ project }: CardStackPreviewProps) {
  return (
    <AnimatePresence mode="wait">
      {project && (
        <motion.div
          key={project.slug}
          className="flex flex-col justify-center h-full"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.35, ease: expo }}
        >
          {/* Title */}
          <h3 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            {project.title}
          </h3>

          {/* Date */}
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/50">
            {new Date(project.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>

          {/* Description */}
          <p className="mt-6 text-base text-muted/80 leading-relaxed max-w-sm">
            {project.description}
          </p>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/50 bg-surface/50 px-3 py-1 text-[10px] font-medium text-muted transition-colors hover:border-accent/30 hover:text-accent"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="mt-6 flex items-center gap-4">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-accent hover:underline underline-offset-4"
              >
                Visit site &#8599;
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-foreground transition-colors"
              >
                GitHub &#8599;
              </a>
            )}
            {!project.url && !project.github && (
              <span className="font-mono text-xs text-muted/50">
                details coming soon
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
