import { getAllProjects, getHighlightProjects } from "@/lib/projects";
import CardStack3D from "@/components/CardStack3D";
import FilterableProjectGrid from "@/components/FilterableProjectGrid";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Projects",
  description: "Selected projects by August Zheng — AI infrastructure, web applications, and research.",
};

export default function ProjectsPage() {
  const highlights = getHighlightProjects();
  const allProjects = getAllProjects();

  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Projects
          </h1>
          <p className="mt-4 text-muted text-lg max-w-xl">
            Things I&apos;ve built, tools I use daily, and experiments that
            went somewhere interesting.
          </p>
        </ScrollReveal>

        <section>
          <CardStack3D projects={highlights} />
        </section>

        <ScrollReveal>
          <div className="mt-20 mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted">
              All Projects
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <FilterableProjectGrid projects={allProjects} />
        </ScrollReveal>
      </div>
    </div>
  );
}
