import { redirect } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Image from "next/image";
import matter from "gray-matter";
import ShareButton from "@/components/ui/share-button";
import FloatingShareButton from '@/components/ui/floating-share-button';
import { ViewCounter } from '@/components/view-counter';
import { components as baseComponents } from "@/components/mdx-components";
import { MDXRemote } from "next-mdx-remote/rsc";

// Define the metadata interface
export interface BlogPostMetadata {
  title: string;
  description: string;
  date: string;
  author?: string;
  category?: string;
  readTime?: string;
  views?: number;
  image?: string;
  tags?: string[];
}

// Type guard to validate the frontmatter structure
function isBlogPostMetadata(data: unknown): data is BlogPostMetadata {
  return (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    "description" in data &&
    "date" in data &&
    typeof (data as { title: unknown }).title === "string" &&
    typeof (data as { description: unknown }).description === "string" &&
    typeof (data as { date: unknown }).date === "string"
  );
}

// Calculate read time in minutes (average reading speed: 200 words per minute)
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params; 
  const filePath = path.join(process.cwd(), `src/content/posts/${slug}.mdx`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: frontmatter } = matter(fileContent);

    // Type guard to validate the frontmatter structure
    const isBlogPostMetadata = (data: unknown): data is BlogPostMetadata => {
      return (
        typeof data === "object" &&
        data !== null &&
        "title" in data &&
        "description" in data &&
        "date" in data
      );
    };

    if (!isBlogPostMetadata(frontmatter)) {
      throw new Error("Invalid blog post metadata: Missing required fields");
    }

    const metadata = frontmatter;

    return {
      title: `${metadata.title} | Aman Sagar's Blog`,
      description: metadata.description,
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        type: "article",
        publishedTime: metadata.date,
        authors: [metadata.author || "Aman Sagar"],
        ...(metadata.image && {
          images: [
            {
              url: metadata.image,
              width: 1200, // Default width
              height: 630, // Default height (Facebook recommended)
              alt: metadata.title,
            },
          ],
        }),
      },
    };
  } catch {

    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'src/content/posts', `${slug}.mdx`);

  try {
    await fs.promises.access(filePath);
    const fileContent = fs.readFileSync(filePath, "utf8");
    
    // Extract content without frontmatter
    const content = fileContent.replace(
      /^---[\s\S]*?---\s*/, 
      ''
    );

    const readTime = calculateReadTime(content);
    const { data: frontmatter } = matter(fileContent);

    // Validate frontmatter structure before using it
    if (!isBlogPostMetadata(frontmatter)) {
      throw new Error("Invalid blog post metadata: Missing required fields");
    }

    const metadata = frontmatter;
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/blog/${slug}`;

    return (
      <>
        <article className="mx-auto max-w-3xl px-0 py-6 md:px-0">
          <header className="mb-8">
            {/* Title and Date for mobile */}
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl leading-tight font-bold tracking-tight text-neutral-600 dark:text-neutral-200 md:text-[40px] lg:text-[40px]">
                {metadata.title}
              </h1>
              <time
                dateTime={metadata.date}
                className="block text-muted-foreground dark:text-neutral-400 text-sm mt-2 md:hidden"
              >
                {new Date(metadata.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            {/* Description */}
            {metadata.description && (
              <p className="text-muted-foreground dark:text-neutral-400 mb-6 mt-2 text-lg leading-relaxed">
                {metadata.description}
              </p>
            )}

            {/* Author and Metadata */}
            <div className="text-muted-foreground dark:text-neutral-300 mb-6 flex flex-col items-start justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Image
                  src="/aman-avatar.webp"
                  alt={metadata.author || "Author"}
                  width={40}
                  height={40}
                  className="border-border h-10 w-10 rounded-full border"
                />
                <div>
                  <div className="text-foreground text-lg font-medium">
                    {metadata.author || "Aman Sagar"}
                  </div>
                  <div className="text-muted-foreground dark:text-neutral-300 flex flex-wrap items-center gap-2 text-sm">
                    {/* Date for desktop only */}
                    <time dateTime={metadata.date} className="hidden md:inline">
                      {new Date(metadata.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    {/* Read time and views: always on desktop, only these on mobile */}
                    <span className="flex items-center gap-2">
                      <span>{readTime}</span>
                      <span>•</span>
                      <ViewCounter slug={slug} initialViews={metadata.views || 0} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Share Button - Hidden on mobile */}
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-muted-foreground dark:text-neutral-300 text-sm">Share:</span>
                <ShareButton title={metadata.title} slug={slug} />
              </div>
            </div>

            {/* Image Banner */}
            {metadata.image && (
              <div className="relative mb-8 flex h-64 w-full items-center justify-center md:h-96">
                <Image
                  src={metadata.image}
                  alt={metadata.title}
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            )}

            {/* Tags */}
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] font-medium text-secondary bg-neutral-50 hover:bg-neutral-100 dark:bg-primary/40 dark:border-primary/20 dark:text-white/90 dark:hover:bg-primary/60 transition-colors duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          
          {/* MDX Content */}
          <MDXRemote source={content} components={baseComponents} />
        </article>

        {/* Mobile Floating Share Button - Hidden on md screens and up */}
        <FloatingShareButton 
          title={metadata.title}
          // description={metadata.description}     
               url={shareUrl}
        />
      </>
    );
  } catch (error) {
    console.error("Error rendering post:", error);
    redirect("/blog");
  }
}

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "src/content/posts");

  try {
    const files = fs.readdirSync(postsDir);
    const posts = files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => ({
        slug: file.replace(/\.mdx$/, ""),
      }));

    if (posts.length === 0) {
      console.warn("No blog posts found in the posts directory");
      return [];
    }

    return posts;
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}