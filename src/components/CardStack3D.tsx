"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import CardStackPreview from "./CardStackPreview";

const expo = [0.16, 1, 0.3, 1] as const;

// Card spacing along the Z axis (px equivalent via translateZ).
const Z_SPACING = 50;
// Small Y offset per card for the staircase look.
const Y_OFFSET = 10;

interface CardStack3DProps {
  projects: Project[];
}

function getProjectHref(project: Project): string {
  if (project.url) return project.url;
  if (project.github) return project.github;
  return `/projects/${project.slug}`;
}

function isExternal(project: Project): boolean {
  return Boolean(project.url || project.github);
}

export default function CardStack3D({ projects }: CardStack3DProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  const hoveredProject = hoveredIndex !== null ? projects[hoveredIndex] : null;

  return (
    <div ref={containerRef}>
      {/* Desktop: 3D stack + preview panel */}
      <div className="mt-8 hidden min-h-[600px] grid-cols-[1.8fr_1fr] items-center gap-12 md:grid lg:gap-24">
        {/* Card stack container */}
        <div className="relative flex items-center justify-start pointer-events-none -ml-12 lg:-ml-48">
          <div
            className="absolute h-[300px] w-[450px] rounded-full bg-accent/5 blur-[100px] -translate-x-12 translate-y-12 pointer-events-none"
            aria-hidden="true"
          />

          <motion.div
            className="relative shrink-0 pointer-events-auto"
            style={{ perspective: 1200 }}
            animate={{ x: hoveredIndex !== null ? -20 : 0 }}
            transition={{ duration: 0.5, ease: expo }}
          >
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
                transform: "rotateY(30deg) rotateX(5deg)",
              }}
            >
              {projects.map((project, i) => {
                const hovered = hoveredIndex === i;
                const reverseI = projects.length - 1 - i;

                return (
                  <motion.div
                    key={project.slug}
                    className="absolute left-0 top-0"
                    style={{ transformStyle: "preserve-3d", zIndex: i }}
                    initial={{ y: 200, opacity: 0, z: reverseI * Z_SPACING }}
                    animate={
                      isInView
                        ? {
                          y: hovered
                            ? reverseI * Y_OFFSET - 30
                            : reverseI * Y_OFFSET,
                          opacity: 1,
                          z: reverseI * Z_SPACING,
                          scale: hovered ? 1.06 : 1,
                        }
                        : { y: 200, opacity: 0, z: reverseI * Z_SPACING }
                    }
                    transition={{
                      y: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: isInView && !hovered ? i * 0.08 : 0,
                      },
                      opacity: { duration: 0.5, delay: isInView ? i * 0.08 : 0 },
                      scale: { duration: 0.3, ease: expo },
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <CardFace
                      project={project}
                      index={i}
                      total={projects.length}
                      isHovered={hovered}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Preview panel */}
        <div className="min-w-0 pr-4">
          <CardStackPreview project={hoveredProject} />
          {!hoveredProject && (
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted/30">
              &larr; hover a card to preview
            </p>
          )}
        </div>
      </div>

      {/* Mobile: simple list fallback */}
      <div className="space-y-3 md:hidden">
        {projects.map((project, i) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.06, ease: expo }}
          >
            <MobileCard project={project} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CardFace({
  project,
  index,
  total,
  isHovered,
}: {
  project: Project;
  index: number;
  total: number;
  isHovered: boolean;
}) {
  const href = getProjectHref(project);
  const external = isExternal(project);

  const content = (
    <div
      className={`
        h-[170px] w-[300px] overflow-hidden rounded-lg border p-5
        flex select-none flex-col justify-between transition-colors duration-200
        ${isHovered
          ? "border-accent/50 bg-surface-hover shadow-[0_0_30px_rgba(224,255,0,0.08)]"
          : "border-border bg-surface"
        }
      `}
      style={{ backfaceVisibility: "hidden" }}
    >
      <div>
        <p
          className={`truncate text-base font-semibold transition-colors ${isHovered ? "text-accent" : "text-foreground"
            }`}
        >
          {project.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {project.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] text-muted/40">
          {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="block cursor-pointer">
      {content}
    </Link>
  );
}

function MobileCard({ project }: { project: Project }) {
  const href = getProjectHref(project);
  const external = isExternal(project);

  const content = (
    <div className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/30 hover:bg-surface-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">
            {project.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {project.description}
          </p>
        </div>
        <span className="ml-3 shrink-0 text-sm text-muted">&#8599;</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}
