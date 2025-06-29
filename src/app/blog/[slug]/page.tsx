import { redirect } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Image from "next/image";
import matter from "gray-matter";
import { components } from "@/components/mdx-components";
import ShareButton from "@/components/ui/share-button";

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
  params: Promise<{ slug: string }>; // Change params type to Promise
}) {
  const { slug } = await params; // Await params here
  const filePath = path.join(process.cwd(), `src/content/posts/${slug}.mdx`);

  try {
    await fs.promises.access(filePath);
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Extract content without frontmatter for read time calculation
    const contentWithoutFrontmatter = fileContent.replace(
      /^---[\s\S]*?---\s*/,
      "",
    );
    const readTime = calculateReadTime(contentWithoutFrontmatter);

    const { data: frontmatter } = matter(fileContent);

    // Validate frontmatter structure before using it
    if (!isBlogPostMetadata(frontmatter)) {
      throw new Error("Invalid blog post metadata: Missing required fields");
    }

    const metadata = frontmatter;

    // Dynamically import and render MDX content
    const MDXContent = await import(`@/content/posts/${slug}.mdx`);

    return (
      <article className="mx-auto max-w-3xl px-0 py-6 md:px-0">
        <header className="mb-8">
          {/* Category */}
          {/* {metadata.category && (
            <div className="mb-3">
              <span className="bg-primary/10 text-primary-foreground hover:bg-primary/20 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors">
                {metadata.category}
              </span>
            </div>
          )} */}

          {/* Title - Made more prominent like Medium */}
          <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight text-neutral-600 dark:text-neutral-200 md:text-[40px] lg:text-[40px]">
            {metadata.title}
          </h1>

          {/* Description */}
          {metadata.description && (
            <p className="text-muted-foreground dark:text-neutral-400 mb-6 text-lg leading-relaxed">
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
                  {metadata.author}
                </div>
                <div className="text-muted-foreground dark:text-neutral-300 flex items-center gap-2 text-sm">
                  <time dateTime={metadata.date}>
                    {new Date(metadata.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span>•</span>
                  <span>{readTime}</span>
                  {/* <span>•</span> */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {metadata.views !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="dark:text-neutral-300">👁️</span>
                  <span className="dark:text-neutral-300">
                    {metadata.views} {metadata.views === 1 ? "view" : "views"}
                  </span>
                </div>
              )}
              <div className="ml-2 flex items-center gap-2">
                <span className="text-muted-foreground dark:text-neutral-300 text-sm">Share:</span>
                <div className="relative inline-flex">
                  <ShareButton title={metadata.title} slug={slug} />
                </div>
              </div>
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
        <div className="prose dark:prose-invert prose-lg max-w-none">
          {/* Render MDX content with components */}
          <MDXContent.default components={components} />

          {/* Add some spacing at the bottom */}
          <div className="h-16"></div>
        </div>
      </article>
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