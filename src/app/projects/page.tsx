import { getAllProjects } from "@/lib/projects";
import CardStack3D from "@/components/CardStack3D";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Projects — August",
  description: "Selected projects by August.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

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
          <CardStack3D projects={projects} />
        </section>
      </div>
    </div>
  );
}
