import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { getPublicApps } from "@/lib/public-apps";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Apps",
  description: "Explore apps and tools built by Aman Sagar.",
  alternates: { canonical: "/apps" },
};

export default async function AppsPage() {
  if (!(await isPublicPageVisible("/apps"))) notFound();
  const apps = await getPublicApps();
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader eyebrow="Apps" title="apps." description="Tools and products I build. Open an app or explore how it works." meta={`${apps.length} ${apps.length === 1 ? "app" : "apps"}`} />
        {apps.length === 0 ? (
          <p className="text-muted-foreground border-border mt-8 rounded-xl border border-dashed p-8 text-center text-sm">No apps are published yet. Check back soon.</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <article key={app.slug} className="border-border bg-card flex min-w-0 flex-col overflow-hidden rounded-xl border">
                <Link href={`/apps/${app.slug}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-2">
                  <div className="bg-muted relative aspect-[16/9] overflow-hidden">
                    {app.coverImage ? <Image src={app.coverImage} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : app.icon ? <div className="flex h-full items-center justify-center"><Image src={app.icon} alt="" width={72} height={72} unoptimized className="size-16 rounded-2xl object-cover" /></div> : <div className="text-muted-foreground flex h-full items-center justify-center text-4xl font-semibold">{app.title.slice(0, 1)}</div>}
                    {app.featured && <span className="bg-background/90 absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur">Featured</span>}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-muted-foreground text-xs">{app.category} · {app.platform}</p><h2 className="mt-1 text-lg font-semibold">{app.title}</h2></div><ArrowUpRight aria-hidden className="text-muted-foreground mt-1 size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{app.tagline || app.description}</p>
                  </div>
                </Link>
                {app.technologies.length > 0 && <div className="mt-auto flex flex-wrap gap-1.5 px-4 pb-4">{app.technologies.slice(0, 4).map((tech) => <span key={tech} className="bg-muted rounded-full px-2 py-1 text-xs">{tech}</span>)}</div>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
