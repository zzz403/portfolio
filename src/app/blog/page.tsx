import Link from "next/link";
import { getPostsByYear } from "@/lib/blog";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Blog",
  description: "Notes on engineering, projects, and the occasional wandering thought.",
};

const categoryLabel: Record<string, string> = {
  tech: "Tech",
  project: "Project",
  thoughts: "Thoughts",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BlogPage() {
  const grouped = getPostsByYear();

  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-muted text-lg">
            Notes on engineering, projects, and the occasional wandering thought.
          </p>
        </ScrollReveal>

        {grouped.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <p className="mt-16 text-muted text-center">
              Nothing here yet. Check back soon.
            </p>
          </ScrollReveal>
        ) : (
          <div className="mt-16 space-y-12">
            {grouped.map(({ year, posts }, gi) => (
              <ScrollReveal key={year} delay={0.1 + gi * 0.05}>
                <div>
                  <h2 className="font-mono text-sm text-muted mb-4">{year}</h2>
                  <div className="space-y-1">
                    {posts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex items-baseline gap-4 py-2 transition-colors"
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
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
