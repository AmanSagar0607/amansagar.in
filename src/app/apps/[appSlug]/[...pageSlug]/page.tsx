import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { PageHeader } from "@/components/page-header";
import { getPublicApp, getPublicAppPage } from "@/lib/public-apps";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { notFound } from "next/navigation";

type RouteProps = { params: Promise<{ appSlug: string; pageSlug: string[] }> };

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { appSlug, pageSlug } = await params;
  if (!(await isPublicPageVisible("/apps"))) return {};
  const [app, page] = await Promise.all([getPublicApp(appSlug), getPublicAppPage(appSlug, pageSlug)]);
  if (!app || !page) return {};
  const title = page.seoTitle?.trim() || page.title;
  const description = page.seoDescription?.trim() || page.description;
  const canonical = `/apps/${app.slug}/${page.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article", ...(page.image ? { images: [page.image] } : {}) },
    twitter: { card: page.image ? "summary_large_image" : "summary", title, description, ...(page.image ? { images: [page.image] } : {}) },
  };
}

export default async function AppContentPage({ params }: RouteProps) {
  const { appSlug, pageSlug } = await params;
  if (!(await isPublicPageVisible("/apps"))) notFound();
  const [app, page] = await Promise.all([getPublicApp(appSlug), getPublicAppPage(appSlug, pageSlug)]);
  if (!app || !page) notFound();
  return (
    <main className="page-shell min-h-screen px-6 pb-16 pt-28 md:pt-32">
      <article className="mx-auto w-full max-w-[760px]">
        <Link href={`/apps/${app.slug}`} className="text-muted-foreground hover:text-foreground mb-6 inline-flex min-h-10 items-center gap-2 text-sm"><ArrowLeft className="size-4" />Back to {app.title}</Link>
        <PageHeader eyebrow={app.title} title={page.title} description={page.description} meta={`Updated ${new Date(page.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`} />
        <div className="article-content prose prose-ncdai dark:prose-invert mx-auto max-w-none px-1 py-8"><ActivityMarkdown content={page.content} /></div>
      </article>
    </main>
  );
}
