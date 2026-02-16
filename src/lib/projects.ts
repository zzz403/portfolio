import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Project {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  image?: string;
  url?: string;
  github?: string;
  featured?: boolean;
  codeSnippet?: string;
  content: string;
}

const projectsDir = path.join(process.cwd(), "content/projects");

function parseProject(filename: string): Project {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(projectsDir, filename), "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    image: data.image,
    url: data.url,
    github: data.github,
    featured: data.featured ?? false,
    codeSnippet: data.codeSnippet,
    content,
  };
}

export function getAllProjects(): Project[] {
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith(".mdx"));
  return files
    .map(parseProject)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedProjects(): Project[] {
  return getAllProjects().filter((p) => p.featured);
}

export function getOtherProjects(): Project[] {
  return getAllProjects().filter((p) => !p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  const filePath = path.join(projectsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return parseProject(`${slug}.mdx`);
}
