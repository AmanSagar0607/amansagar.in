import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { PageHeader } from "@/components/page-header";
import { getPublicApp } from "@/lib/public-apps";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { notFound } from "next/navigation";

type RouteProps = { params: Promise<{ appSlug: string }> };

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { appSlug } = await params;
  if (!(await isPublicPageVisible("/apps"))) return {};
  const app = await getPublicApp(appSlug);
  if (!app) return {};
  const title = app.seoTitle?.trim() || app.title;
  const description = app.seoDescription?.trim() || app.description;
  const canonical = `/apps/${app.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", ...(app.coverImage ? { images: [app.coverImage] } : {}) },
    twitter: { card: app.coverImage ? "summary_large_image" : "summary", title, description, ...(app.coverImage ? { images: [app.coverImage] } : {}) },
  };
}

export default async function AppDetailPage({ params }: RouteProps) {
  const { appSlug } = await params;
  if (!(await isPublicPageVisible("/apps"))) notFound();
  const app = await getPublicApp(appSlug);
  if (!app) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.title,
    description: app.description,
    applicationCategory: app.category,
    operatingSystem: app.platform,
    url: new URL(`/apps/${app.slug}`, process.env.NEXT_PUBLIC_SITE_URL || "https://www.amansagar.in").toString(),
    ...(app.launchUrl ? { installUrl: app.launchUrl } : {}),
    ...(app.coverImage ? { image: app.coverImage } : {}),
  };
  const pages = [...app.pages].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <main className="page-shell min-h-screen">
      <section className="page-section">
        <Link href="/apps" className="text-muted-foreground hover:text-foreground mb-6 inline-flex min-h-10 items-center gap-2 text-sm"><ArrowLeft className="size-4" />All apps</Link>
        {app.coverImage && <div className="border-border bg-muted relative mb-8 aspect-[2/1] overflow-hidden rounded-xl border"><Image src={app.coverImage} alt={`${app.title} cover`} fill priority unoptimized sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" /></div>}
        <PageHeader eyebrow={`${app.category} · ${app.platform}`} title={app.title} description={app.tagline || app.description} meta={app.featured ? "Featured app" : undefined} />
        <div className="mx-auto grid max-w-6xl gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <article className="article-content prose prose-ncdai dark:prose-invert max-w-none"><p className="lead">{app.description}</p>{app.content && <ActivityMarkdown content={app.content} />}</article>
          <aside className="space-y-6">
            {app.launchUrl && <a href={app.launchUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground hover:opacity-90 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium">Open app <ArrowUpRight className="size-4" /></a>}
            {app.sourceUrl && <a href={app.sourceUrl} target="_blank" rel="noopener noreferrer" className="border-border hover:bg-accent inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium">View source <ArrowUpRight className="size-4" /></a>}
            {app.technologies.length > 0 && <section><h2 className="text-sm font-semibold">Built with</h2><ul className="mt-2 flex flex-wrap gap-2">{app.technologies.map((tech) => <li key={tech} className="bg-muted rounded-full px-2.5 py-1 text-xs">{tech}</li>)}</ul></section>}
            {pages.length > 0 && <nav aria-label={`${app.title} pages`}><h2 className="text-sm font-semibold">More about this app</h2><ul className="mt-2 space-y-1">{pages.map((page) => <li key={page.slug}><Link className="text-muted-foreground hover:text-foreground inline-flex min-h-9 items-center text-sm underline-offset-4 hover:underline" href={`/apps/${app.slug}/${page.slug}`}>{page.title}</Link></li>)}</ul></nav>}
          </aside>
        </div>
        {app.screenshots.length > 0 && <section className="mx-auto max-w-6xl pb-12"><h2 className="mb-4 text-lg font-semibold">Screenshots</h2><div className="grid gap-4 sm:grid-cols-2">{app.screenshots.map((src, index) => <div key={`${src}-${index}`} className="border-border bg-muted relative aspect-video overflow-hidden rounded-lg border"><Image src={src} alt={`${app.title} screenshot ${index + 1}`} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" /></div>)}</div></section>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </section>
    </main>
  );
}
