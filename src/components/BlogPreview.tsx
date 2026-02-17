import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

const categoryLabel: Record<string, string> = {
  tech: "Tech",
  project: "Project",
  thoughts: "Thoughts",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BlogPreview() {
  const posts = getAllPosts().slice(0, 2);

  if (posts.length === 0) return null;

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="font-mono text-sm text-accent mb-6">Blog</p>
        </ScrollReveal>

        <div className="space-y-1">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={0.1 + i * 0.05}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-baseline gap-4 py-3 transition-colors"
              >
                <time className="shrink-0 font-mono text-xs text-muted/60 w-14">
                  {formatDate(post.date)}
                </time>
                <span className="text-foreground group-hover:text-accent transition-colors">
                  {post.title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted/40">
                  {categoryLabel[post.category] ?? post.category}
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
            >
              View all posts
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
