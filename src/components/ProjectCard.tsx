"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface ProjectCardProps {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
}

export default function ProjectCard({
  slug,
  title,
  description,
  tags,
  image,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`}>
      <motion.article
        className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-surface-hover"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {image && (
          <div className="overflow-hidden">
            <motion.div
              className="aspect-video w-full bg-surface-hover"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold transition-colors group-hover:text-accent">
              {title}
            </h3>
            <span className="text-muted opacity-0 transition-opacity group-hover:opacity-100">
              &#8599;
            </span>
          </div>
          <p className="mt-2 text-sm text-muted line-clamp-2">{description}</p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}
