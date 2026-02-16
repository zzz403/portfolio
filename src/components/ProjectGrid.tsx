import { getFeaturedProjects } from "@/lib/projects";
import FeaturedBento from "./FeaturedBento";
import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

export default async function ProjectGrid() {
  const featured = getFeaturedProjects();

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-6">Projects</p>
        </ScrollReveal>
        <FeaturedBento projects={featured} />

        <div className="mt-10 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            View all projects
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
