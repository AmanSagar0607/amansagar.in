import React, { ReactNode } from 'react';
import Link from "next/link";
import { Calendar, Dot } from "lucide-react";
import { getMDXFiles, type MDXFile } from "@/lib/mdx-utils";
import { SectionHeading } from "./section-heading";
import { MotionDiv } from "./motion-div";

// Type definitions for JSX elements
type JSXElement = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: JSXElement;
    }
  }
}

interface BlogPostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

interface BlogPost extends Omit<MDXFile, 'frontmatter'> {
  frontmatter: BlogPostFrontmatter;
}

interface LandingBlogsProps {
  children?: ReactNode;
}

export const LandingBlogs: React.FC<LandingBlogsProps> = async () => {
  const posts = (await getMDXFiles("src/content/posts")) as unknown as BlogPost[];
  const recentPosts = posts.slice(0, 2); // Show 2 most recent posts
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatLongDate = (dateString?: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (recentPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-bold tracking-tight">
          Latest Articles
        </h2>
        <Link
          href="/blog"
          className="text-secondary inline-flex items-center text-sm font-medium hover:underline"
        >
          <span className="hidden sm:inline">View all articles</span>
          <span className="sm:hidden">View all</span>
          <span className="ml-1">→</span>
        </Link>
      </div>
      <SectionHeading delay={0.2}>
        I love writing blogs and sharing my knowledge with the world.
      </SectionHeading>

      <div className="space-y-8">
        {recentPosts.map((post, idx) => (
          <MotionDiv
            key={`motion-${post.slug}`}
            initial={{ opacity: 0, y: 20, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.4,
              delay: idx * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <article key={post.slug} className="group relative">
              <div className="relative">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="text-md text-foreground flex items-start gap-0 font-bold">
                      <Dot className="-ml-5.5 sm:hidden" />
                      <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline"
                      >
                        {post.frontmatter.title}
                      </Link>
                    </h3>
                    <div className="text-secondary mt-1 flex items-center gap-1.5 text-[13px] sm:hidden">
                      <Calendar className="h-3.5 w-3.5" />
                      <time
                        dateTime={post.frontmatter.date}
                      >
                        {formatDate(post.frontmatter.date)}
                      </time>
                    </div>
                  </div>
                  <time
                    dateTime={post.frontmatter.date}
                    className="text-secondary mt-1 hidden text-[13px] whitespace-nowrap sm:block"
                  >
                    {formatLongDate(post.frontmatter.date)}
                  </time>
                </div>

                {post.frontmatter.description && (
                  <p className="text-secondary mt-2 max-w-md text-sm md:max-w-lg">
                    {post.frontmatter.description}
                  </p>
                )}

                {Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.frontmatter.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-secondary bg-neutral-50 hover:bg-neutral-100 dark:bg-primary/40 dark:border-primary/20 dark:text-white/90 dark:hover:bg-primary/60 transition-colors duration-200"
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
          </MotionDiv>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/blog"
          className="text-primary/50 dark:text-white/40 inline-flex items-center text-sm font-medium hover:underline"
        >
          View all articles <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
}
