import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — August`,
    description: post.description,
  };
}

const categoryLabel: Record<string, string> = {
  tech: "Tech",
  project: "Project",
  thoughts: "Thoughts",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground mb-8"
        >
          &#8592; Back to blog
        </Link>
        <div className="flex items-center gap-3 text-sm text-muted mb-4">
          <time>{formatDate(post.date)}</time>
          <span className="text-border">·</span>
          <span className="font-mono text-xs uppercase tracking-wider">
            {categoryLabel[post.category] ?? post.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 text-muted text-lg">{post.description}</p>
        )}
        <hr className="my-10 border-border" />
        <div className="prose">
          <MDXRemote source={post.content} />
        </div>
      </div>
    </article>
  );
}
