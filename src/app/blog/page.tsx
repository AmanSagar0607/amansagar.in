import Link from 'next/link';
import { Metadata } from 'next';
import { getMDXFiles } from '@/lib/mdx-utils';

export const metadata: Metadata = {
  title: 'Blog | Aman Sagar',
  description: 'Thoughts, stories and ideas about software development and more.',
};

export default async function BlogPage() {
  const posts = await getMDXFiles('src/content/posts');

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">No posts found</h1>
        <p className="mt-2 text-muted-foreground">
          Check back later for new content.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Thoughts, stories and ideas about software development and more.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="group relative">
            <div className="relative
              before:absolute
              before:-inset-4
              before:block
              before:rounded-lg
              before:bg-muted/50
              before:opacity-0
              before:transition-opacity
              before:duration-200
              before:content-['']
              group-hover:before:opacity-100
              dark:before:bg-muted-foreground/10">
              <div className="relative">
                <h2 className="text-2xl font-bold tracking-tight">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-foreground underline hover:underline"
                  >
                    {post.frontmatter.title}
                  </Link>
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {post.frontmatter.description}
                </p>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <time dateTime={new Date(post.frontmatter.date).toISOString()}>
                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="mx-2">•</span>
                  <span>{post.frontmatter.readTime || '5 min read'}</span>
                </div>
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.frontmatter.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
