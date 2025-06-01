import Link from 'next/link';
import { getMDXFiles } from '@/lib/mdx-utils';

export async function LandingBlogs() {
  const posts = await getMDXFiles('src/content/posts');
  const recentPosts = posts.slice(0, 2); // Show 2 most recent posts

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Latest Articles</h2>
        <Link 
          href="/blog" 
          className="text-sm font-medium text-secondary hover:underline inline-flex items-center"
        >
          View all articles <span className="ml-1">→</span>
        </Link>
      </div>
      <p className="text-secondary md:text-base text-sm pt-2 max-w-lg mb-8">I love writing blogs and sharing my knowledge with the world.</p>
      
      
      <div className="space-y-8">
        {recentPosts.map((post) => (
          <article key={post.slug} className="group relative">
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-md font-bold text-foreground">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="hover:underline"
                  >
                    {post.frontmatter.title}
                  </Link>
                </h3>
                <time 
                  dateTime={new Date(post.frontmatter.date).toISOString()}
                  className="text-[13px] text-secondary whitespace-nowrap mt-1"
                >
                  {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              
              <p className="mt-1 text-secondary text-sm max-w-md md:max-w-lg">
                  {post.frontmatter.description}
                </p>
              
              {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.frontmatter.tags.map((tag: string) => (
                    <span
                      key={tag}
                       className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-secondary bg-neutral-50 hover:bg-neutral-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* <div className="mt-3 pt-3 ">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                >
                  Read more <span className="ml-1">→</span>
                </Link>
              </div> */}
            </div>
          </article>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View all articles <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
