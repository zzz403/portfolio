import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import ProjectDemo from "@/components/ProjectDemo";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground mb-8"
        >
          &#8592; Back to projects
        </Link>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-muted text-lg">{project.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              Live site &#8599;
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-foreground"
            >
              GitHub &#8599;
            </a>
          )}
        </div>

        {/* Demo animation for featured projects */}
        <ProjectDemo slug={project.slug} />

        <hr className="my-10 border-border" />
        <div className="prose">
          <MDXRemote source={project.content} />
        </div>
      </div>
    </article>
  );
}
