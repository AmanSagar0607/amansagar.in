import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { PageHeader } from "@/components/page-header";
import { ShareMenu } from "@/components/share-menu";
import {
  JourneyBreadcrumbs,
  Technologies,
} from "@/components/journey/journey-ui";
import { getPublicActivities, getPublicTracks } from "@/lib/public-journey";
import { journeyMetadata } from "@/lib/journey/seo";
import { getPublicProjectsBySlug } from "@/lib/public-projects";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  if (!(await isPublicPageVisible("/journey")))
    return { title: "Not found", robots: { index: false, follow: false } };
  const { slug } = await params;
  const activity = (await getPublicActivities()).find(
    (item) => item.slug === slug,
  );
  if (!activity)
    return {
      title: "Activity not found",
      robots: { index: false, follow: false },
    };
  return journeyMetadata(
    activity.seoTitle || activity.title,
    activity.seoDescription || activity.description,
    activity.blogSlug
      ? `/blog/${activity.blogSlug}`
      : `/journey/activity/${slug}`,
    activity.content.trim().split(/\s+/).length >= 80,
    [...activity.technologies, ...activity.tags],
  );
}

export default async function ActivityPage({ params }: Props) {
  const { slug } = await params;
  if (!(await isPublicPageVisible("/journey"))) notFound();
  const [activities, tracks] = await Promise.all([
    getPublicActivities(),
    getPublicTracks(),
  ]);
  const activity = activities.find((item) => item.slug === slug);
  if (!activity) notFound();
  if (activity.blogSlug) redirect(`/blog/${activity.blogSlug}`);
  const linkedTracks = tracks.filter((track) =>
    activity.trackSlugs.includes(track.slug),
  );
  const projects = await getPublicProjectsBySlug(activity.projectSlugs);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.amansagar.in";
  const url = `${siteUrl}/journey/activity/${activity.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: activity.title,
    description: activity.description,
    datePublished: activity.date,
    dateModified: activity.updatedAt,
    author: { "@type": "Person", name: "Aman Sagar", url: siteUrl },
    mainEntityOfPage: url,
    keywords: [...activity.technologies, ...activity.tags].join(", "),
    ...(activity.coverImage ? { image: activity.coverImage } : {}),
  };
  return (
    <main className="page-shell pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <JourneyBreadcrumbs title={activity.title} />
      <PageHeader
        eyebrow={activity.type}
        title={activity.title}
        description={activity.description}
        meta={`${new Date(activity.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })} · ${activity.completion.replaceAll("-", " ")}`}
      />
      <div className="screen-line-bottom flex flex-wrap items-center justify-between gap-4 px-4 py-5">
        <Technologies items={activity.technologies} />
        <ShareMenu
          title={activity.title}
          url={`/journey/activity/${activity.slug}`}
        />
      </div>
      {activity.coverImage && (
        <figure className="px-4 pt-6">
          {/* Cover URLs are validated at publishing; native img permits the existing arbitrary content URL workflow. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="border-border max-h-96 w-full rounded-lg border object-cover"
          />
        </figure>
      )}
      <article className="article-body min-w-0 px-4 py-8">
        <ActivityMarkdown content={activity.content} />
      </article>
      {(linkedTracks.length > 0 || projects.length > 0) && (
        <section className="screen-line-bottom space-y-3 px-4 py-5">
          <h2 className="text-base font-medium">Part of the journey</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {linkedTracks.map((track) => (
              <Link
                className="link-underline inline-flex min-h-11 items-center"
                key={track.slug}
                href={`/journey/${track.slug}`}
              >
                {track.title}
              </Link>
            ))}
            {projects.map((project) => (
              <Link
                className="link-underline inline-flex min-h-11 items-center"
                key={project.slug}
                href={`/projects/${project.slug}`}
              >
                {project.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      {(activity.references.length > 0 ||
        activity.githubUrl ||
        activity.demoUrl ||
        activity.attachments.length > 0) && (
        <section className="space-y-3 px-4 py-5">
          <h2 className="text-base font-medium">References & resources</h2>
          <ul className="space-y-3 text-sm">
            {[
              ...activity.references,
              ...activity.attachments,
              ...(activity.githubUrl
                ? [{ title: "GitHub repository", url: activity.githubUrl }]
                : []),
              ...(activity.demoUrl
                ? [{ title: "Live demo", url: activity.demoUrl }]
                : []),
            ].map((reference, index) => (
              <li key={`${reference.url}-${index}`}>
                <a
                  className="link-underline inline-flex min-h-11 items-center break-words"
                  href={reference.url}
                  rel="noopener noreferrer"
                >
                  {reference.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-muted-foreground px-4 py-5 text-xs">
        Updated{" "}
        <time dateTime={activity.updatedAt}>
          {new Date(activity.updatedAt).toLocaleDateString("en-US", {
            timeZone: "UTC",
          })}
        </time>
      </p>
    </main>
  );
}

