import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import { notFound } from "next/navigation";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return { title: "About", description: settings.aboutDescription ?? defaultSiteSettings.aboutDescription };
}

export default async function AboutPage() {
  if (!(await isPublicPageVisible("/about"))) notFound();
  const settings = await getPublicSiteSettings();
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="About"
          title="about."
          description={settings.aboutDescription ?? defaultSiteSettings.aboutDescription ?? ""}
          meta="Product-minded engineering"
        />

        <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#e7e7e7] dark:border-[#1c1c1c]" />

        <div className="px-4 py-6">
          <div className="hero-copy mx-auto w-full max-w-[680px]">
            {(settings.aboutParagraphs ?? defaultSiteSettings.aboutParagraphs ?? []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>
      </section>
    </main>
  );
}
