import Link from 'next/link';
import { Metadata } from 'next';
import { getMDXFiles } from '@/lib/mdx-utils';
import { Heading } from '@/components/heading';
import { SubHeading } from '@/components/subheading';

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
        <Heading as="h1">All Blog Posts</Heading>
        <SubHeading as="h2">Thoughts, stories and ideas about software development and more.</SubHeading>
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
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-bold tracking-tight text-[#242424]">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-foreground no-underline hover:underline"
                    >
                      {post.frontmatter.title}
                    </Link>
                  </h2>
                  <div className="mt-1 flex-shrink-0 whitespace-nowrap text-sm text-secondary">
                    <time dateTime={new Date(post.frontmatter.date).toISOString()}>
                      {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {/* <span className="mx-2">•</span>
                    <span>{post.frontmatter.readTime || '5 min read'}</span> */}
                  </div>
                </div>
                <p className="mt-1 text-secondary max-w-md md:max-w-lg">
                  {post.frontmatter.description}
                </p>
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.frontmatter.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                      className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-secondary bg-neutral-50 hover:bg-neutral-100"
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
