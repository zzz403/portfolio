"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import YouWoDemo from "./demos/YouWoDemo";
import OpenBrowserDemo from "./demos/OpenBrowserDemo";
import CanvasDemo from "./demos/CanvasDemo";
import EditorDemo from "./demos/EditorDemo";

const expo = [0.16, 1, 0.3, 1] as const;

// Map project slugs to their demo components
type DemoProps = { replayToken?: number; onComplete?: () => void };

const demoMap: Record<string, React.ComponentType<DemoProps>> = {
  youwoai: YouWoDemo,
  "openbrowser-ai": OpenBrowserDemo,
  "project-alpha": CanvasDemo,
  "zen-editor": EditorDemo,
};

interface FeaturedBentoProps {
  projects: Project[];
}

function CardWrapper({
  project,
  className,
  children,
}: {
  project: Project;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/projects/${project.slug}`} className={className}>
      {children}
    </Link>
  );
}

export default function FeaturedBento({ projects }: FeaturedBentoProps) {
  const [replayTokens, setReplayTokens] = useState<Record<string, number>>({});
  const [canReplay, setCanReplay] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-10 md:grid-cols-2 md:grid-rows-[auto_auto]">
      {projects.map((project, i) => {
        const Demo = demoMap[project.slug];
        const replayToken = replayTokens[project.slug] ?? 0;

        return (
          <CardWrapper
            key={project.slug}
            project={project}
            className={
              projects.length >= 3 &&
                i === projects.length - 1 &&
                projects.length % 2 === 1
                ? "md:col-span-2"
                : ""
            }
          >
            <motion.article
              className="group relative overflow-hidden rounded-xl border border-border bg-surface h-full transition-colors hover:bg-surface-hover"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: expo,
              }}
              whileHover={{ y: -3 }}
              onMouseEnter={() => {
                if (!canReplay[project.slug]) return;
                setReplayTokens((prev) => ({
                  ...prev,
                  [project.slug]: (prev[project.slug] ?? 0) + 1,
                }));
                setCanReplay((prev) => ({
                  ...prev,
                  [project.slug]: false,
                }));
              }}
            >
              {/* Demo area */}
              {Demo && (
                <div className="pointer-events-none">
                  <Demo
                    replayToken={replayToken}
                    onComplete={() => {
                      setCanReplay((prev) => ({
                        ...prev,
                        [project.slug]: true,
                      }));
                    }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold transition-colors group-hover:text-accent">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-muted opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-3 text-lg">
                    &#8599;
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          </CardWrapper>
        );
      })}
    </div>
  );
}
