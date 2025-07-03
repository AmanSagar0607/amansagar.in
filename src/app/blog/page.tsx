import Link from 'next/link';
import { Metadata } from 'next';
import { getMDXFiles } from '@/lib/mdx-utils';
import { Heading } from '@/components/heading';
import { SubHeading } from '@/components/subheading';
import { Dot } from 'lucide-react';

interface BlogPost {
  slug: string;
  frontmatter: {
    title: string;
    description: string;
    date: string;
    author?: string;
    category?: string;
    readTime?: string;
    tags?: string[];
  };
}

export const metadata: Metadata = {
  title: 'Blog | Aman Sagar',
  description: 'Thoughts, stories and ideas about software development and more.',
};

export default async function BlogPage() {
  const posts = (await getMDXFiles('src/content/posts')) as unknown as BlogPost[];

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
    <div className="container py-4">
      <div className="mb-12">
        <Heading as="h1">All Blog Posts</Heading>
        <SubHeading as="h2">Thoughts, stories and ideas about software development and more.</SubHeading>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4">
                  <h2 className="text-lg font-bold tracking-tight flex items-start gap-0 text-[#242424]">
                    <Dot className="-ml-5.5 sm:hidden" />
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-foreground no-underline hover:underline dark:text-neutral-400"
                    >
                      {post.frontmatter.title}
                    </Link>
                  </h2>
                  <div className="mt-1 text-sm text-secondary flex items-center gap-1">
                    <time dateTime={post.frontmatter.date} className="block md:inline">
                      {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span className="mx-1 block md:hidden">•</span>
                    <span className="block md:hidden">{post.frontmatter.readTime || '5 min read'}</span>
                  </div>
                </div>
                {post.frontmatter.description && (
                  <p className="mt-1 text-secondary max-w-md md:max-w-lg">
                    {post.frontmatter.description}
                  </p>
                )}
                {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.frontmatter.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-secondary bg-neutral-50 hover:bg-neutral-100 dark:bg-primary/40 dark:border-primary/20 dark:text-white/90 dark:hover:bg-primary/60 transition-colors duration-200"
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
