import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogCategory = "tech" | "project" | "thoughts";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: BlogCategory;
  project?: string; // linked project slug
  content: string;
}

const blogDir = path.join(process.cwd(), "content/blog");

function parsePost(filename: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(blogDir, filename), "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    category: data.category ?? "thoughts",
    project: data.project,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
  return files
    .map(parsePost)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const filePath = path.join(blogDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  return parsePost(`${slug}.mdx`);
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

/** Group posts by year, sorted descending */
export function getPostsByYear(): { year: number; posts: BlogPost[] }[] {
  const posts = getAllPosts();
  const grouped = new Map<number, BlogPost[]>();

  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    if (!grouped.has(year)) grouped.set(year, []);
    grouped.get(year)!.push(post);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, posts]) => ({ year, posts }));
}
