"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/projects";

const CATEGORIES = ["All", "AI", "Web", "Interactive", "Research"] as const;
type Category = (typeof CATEGORIES)[number];

const TAG_TO_CATEGORY: Record<string, Category> = {
  AI: "AI",
  "AI Agent": "AI",
  "OpenAI API": "AI",
  NLP: "AI",
  LangGraph: "AI",
  CDP: "AI",
  Healthcare: "AI",
  React: "Web",
  TypeScript: "Web",
  JavaScript: "Web",
  "Node.js": "Web",
  CSS: "Web",
  "Chrome API": "Web",
  "Web Scraping": "Web",
  WebRTC: "Web",
  Unity: "Interactive",
  "C#": "Interactive",
  "VR SDK": "Interactive",
  "3D Modeling": "Interactive",
  Arduino: "Interactive",
  "Sensor Tech": "Interactive",
  "Voice Tech": "Interactive",
  "Game Design": "Interactive",
  "Data Processing": "Research",
  SQL: "Research",
  Education: "Research",
  EdTech: "Research",
};

function getProjectCategories(project: Project): Category[] {
  const cats = new Set<Category>();
  for (const tag of project.tags) {
    const cat = TAG_TO_CATEGORY[tag];
    if (cat) cats.add(cat);
  }
  return Array.from(cats);
}

function getProjectHref(project: Project): string {
  if (project.url) return project.url;
  if (project.github) return project.github;
  return `/projects/${project.slug}`;
}

function isExternal(project: Project): boolean {
  return Boolean(project.url || project.github);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function FilterableProjectGrid({
  projects,
}: {
  projects: Project[];
}) {
  const [active, setActive] = useState<Category>("All");

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => getProjectCategories(p).includes(active));

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${
              active === cat
                ? "bg-accent text-background"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <GridCard key={project.slug} project={project} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GridCard({ project, index }: { project: Project; index: number }) {
  const href = getProjectHref(project);
  const external = isExternal(project);

  const card = (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.2, delay: index * 0.03 },
        scale: { duration: 0.2, delay: index * 0.03 },
        layout: { duration: 0.3 },
      }}
      className="group rounded-lg border border-border bg-surface p-5 transition-colors duration-200 hover:border-accent/30 hover:bg-surface-hover"
      whileHover={{ y: -3 }}
    >
      <h3 className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-accent">
        {project.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
        {project.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-muted/40">
          {formatDate(project.date)}
        </span>
      </div>
    </motion.div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {card}
      </a>
    );
  }

  return <Link href={href}>{card}</Link>;
}
