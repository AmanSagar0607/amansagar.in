import { notFound } from "next/navigation";
import { getPublicPost, getPublicPosts } from "@/lib/public-posts";
import { Metadata } from "next";
import { getPublicActivities, getPublicTracks } from "@/lib/public-journey";
import { getPublicProjectsBySlug } from "@/lib/public-projects";
import Image from "next/image";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { components as baseComponents } from "@/components/mdx-components";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { ShareMenu } from "@/components/share-menu";
import { TOCMinimap } from "@/components/toc-minimap";
import { serializeJsonLd } from "@/lib/json-ld";
import { articleHeadings, articleText } from "@/lib/article-content";

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
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
}

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

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = articleText(content).split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { title: 'Post Not Found', robots: { index: false } };

  try {
    const post = await getPublicPost(slug);
    const frontmatter = post?.frontmatter;

    if (!post || !isBlogPostMetadata(frontmatter)) {
      throw new Error("Invalid blog post metadata");
    }

    const image = frontmatter.image || "/opengraph-image";
    const seoTitle = typeof frontmatter.seoTitle === "string" && frontmatter.seoTitle.trim() ? frontmatter.seoTitle : frontmatter.title;
    const seoDescription = typeof frontmatter.seoDescription === "string" && frontmatter.seoDescription.trim() ? frontmatter.seoDescription : frontmatter.description;

    return {
      title: seoTitle,
      description: seoDescription,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `/blog/${slug}`,
        type: "article",
        publishedTime: frontmatter.date,
        modifiedTime: frontmatter.updatedAt || frontmatter.date,
        authors: [frontmatter.author || "Aman Sagar"],
        tags: frontmatter.tags,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: frontmatter.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Post Not Found",
      robots: { index: false },
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  try {
    const post = await getPublicPost(slug);
    const frontmatter = post?.frontmatter;

    if (!post || !isBlogPostMetadata(frontmatter)) {
      throw new Error("Invalid blog post metadata");
    }

    const content = post.content;
    const [journeyActivities, journeyTracks] = await Promise.all([getPublicActivities(), getPublicTracks()]);
    const related = journeyActivities.find(a => a.blogSlug === slug);
    const relatedTracks = journeyTracks.filter(t => related?.trackSlugs.includes(t.slug));
    const relatedProjects = await getPublicProjectsBySlug(related?.projectSlugs || []);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.amansagar.in';
    const schema = { image: frontmatter.image ? new URL(frontmatter.image, siteUrl).href : undefined, keywords: frontmatter.tags, wordCount: articleText(content).split(/\s+/).filter(Boolean).length, articleSection: frontmatter.category || "Technology", inLanguage: "en", '@context': 'https://schema.org', '@type': 'TechArticle', headline: frontmatter.title, description: frontmatter.description, datePublished: frontmatter.date, dateModified: frontmatter.updatedAt || frontmatter.date, author: { '@type': 'Person', name: frontmatter.author || 'Aman Sagar', url: siteUrl }, mainEntityOfPage: siteUrl + '/blog/' + slug };
    const readTime = frontmatter.readTime || calculateReadTime(content);
    const headings = articleHeadings(content);

    return (
      <main className="page-shell min-h-screen px-6 pb-16 pt-28 text-[14px] leading-[22px] text-[#0a0a0a] dark:text-[#d8d8d8] md:pt-32">
        <aside className="fixed right-8 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
          <TOCMinimap items={headings} />
        </aside>
        <aside className="fixed inset-x-0 bottom-4 z-40 flex justify-end px-4 xl:hidden">
          <TOCMinimap items={headings} mobile />
        </aside>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
        <article className="mx-auto w-full max-w-[680px]">
          <div className="pt-4 pb-8">
            <Link
              href="/blog"
              className="group inline-flex items-center text-[13px] text-[#6e6e6e] transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 dark:text-[#7a7a7a] dark:hover:text-white dark:focus-visible:ring-white/70"
            >
              <IconArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>
          </div>

          <div>
            <header className="pb-8 pt-2">
              <p className="mb-5 text-[#6e6e6e] dark:text-[#7a7a7a]">Blog</p>
              <h1 className="max-w-[620px] text-[24px] font-medium leading-8 text-black dark:text-white md:text-[28px] md:leading-9">
                {frontmatter.title}
              </h1>
              {frontmatter.description ? (
                <p className="mt-4 max-w-[620px] text-[#4a4a4a] dark:text-[#b0b0b0]">
                  {frontmatter.description}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#6e6e6e] dark:text-[#7a7a7a]">
                <span>{frontmatter.author || "Aman Sagar"}</span>
                <span>
                  {new Date(frontmatter.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span>{readTime}</span>
                <ShareMenu title={frontmatter.title} url={`/blog/${slug}`} />
              </div>

              {frontmatter.image ? (
                <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg border border-[#e7e7e7] bg-muted/30 dark:border-[#1c1c1c]">
                  <Image
                    src={frontmatter.image}
                    alt={frontmatter.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : null}
            </header>

            <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#e7e7e7] dark:border-[#1c1c1c]" />
          </div>

          <div className="article-body pt-10">
            {post.format === "trusted-mdx" ? <MDXRemote source={content} components={baseComponents} /> : <ActivityMarkdown content={content} />}
          </div>
          {(relatedTracks.length > 0 || relatedProjects.length > 0) && <section className="mt-8 border-t border-border py-6">
            <h2 className="text-lg font-medium">Related learning and projects</h2>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">{relatedTracks.map(t => <Link className="link-underline inline-flex min-h-11 items-center" key={t.slug} href={'/journey/' + t.slug}>{t.title}</Link>)}{relatedProjects.map(p => <Link className="link-underline inline-flex min-h-11 items-center" key={p.slug} href={'/projects/' + p.slug}>{p.title}</Link>)}</div>
          </section>}
        </article>
      </main>
    );
  } catch (error) {
    console.error("Error rendering post:", error);
    notFound();
  }
}

export async function generateStaticParams() {
  return (await getPublicPosts()).map(post => ({ slug: post.slug }));
}
