import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { getPublicPage } from "@/lib/public-pages";

type RouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPage(slug);
  if (!page) return {};
  const title = page.seoTitle?.trim() || page.title;
  const description = page.seoDescription?.trim() || page.description;
  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title,
      description,
      url: `/${page.slug}`,
      type: "website",
      ...(page.image ? { images: [page.image] } : {}),
    },
    twitter: {
      card: page.image ? "summary_large_image" : "summary",
      title,
      description,
      ...(page.image ? { images: [page.image] } : {}),
    },
  };
}

export default async function CustomPage({ params }: RouteProps) {
  const { slug } = await params;
  const page = await getPublicPage(slug);
  if (!page) notFound();

  return (
    <main className="page-shell min-h-screen px-6 pb-16 pt-28 md:pt-32">
      <article className="mx-auto w-full max-w-[760px]">
        <PageHeader
          eyebrow="Page"
          title={page.title}
          description={page.description}
          meta={page.updatedAt ? `Updated ${new Date(page.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : undefined}
        />
        <div className="article-content prose prose-ncdai dark:prose-invert mx-auto max-w-none px-1 py-8">
          <ActivityMarkdown content={page.content} />
        </div>
      </article>
    </main>
  );
}
