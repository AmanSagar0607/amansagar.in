import type { Activity } from "@/lib/journey/types";
import type { InitialContentSnapshot, ManagedPost } from "./content-types";
import { isPublicContent } from "./validation";

/** Build the public activity stream from publishable records; article content remains authoritative in posts. */
export function publicJourneyActivities(
  snapshot: InitialContentSnapshot,
  now = Date.now(),
): Activity[] {
  const posts = snapshot.posts.filter((post) => isPublicContent(post, now));
  const publicTracks = new Set(
    snapshot.journey.tracks
      .filter((track) => track.visibility === "public")
      .map((track) => track.slug),
  );
  const publicProjects = new Set(
    snapshot.projects
      .filter((project) => isPublicContent(project, now))
      .map((project) => project.slug),
  );
  const activities = snapshot.journey.activities
    .filter(
      (activity) =>
        isPublicContent(
          {
            status: activity.status,
            visibility: activity.visibility,
            publishedAt: activity.date,
          },
          now,
        ) &&
        !activity.sample &&
        (!activity.blogSlug ||
          posts.some((post) => post.slug === activity.blogSlug)),
    )
    .map((activity) => {
      const post = activity.blogSlug
        ? posts.find((item) => item.slug === activity.blogSlug)
        : undefined;
      return {
        slug: activity.slug,
        title: post?.title ?? activity.title,
        description: post?.description ?? activity.description,
        content: post?.content ?? activity.content,
        type: activity.type,
        date: post?.publishedAt ?? activity.date,
        updatedAt: post?.updatedAt ?? activity.updatedAt,
        status: activity.status,
        visibility: activity.visibility,
        sample: activity.sample,
        completion: activity.completion,
        technologies: activity.technologies,
        tags: activity.tags,
        references: activity.references.map(({ title, url }) => ({
          title,
          url,
        })),
        attachments: activity.attachments.map(({ title, url }) => ({
          title,
          url,
        })),
        githubUrl: activity.githubUrl,
        demoUrl: activity.demoUrl,
        coverImage: activity.coverImage,
        seoTitle: activity.seoTitle,
        seoDescription: activity.seoDescription,
        blogSlug: activity.blogSlug,
        milestoneKind: activity.milestoneKind,
        verifiedEvidenceUrl: activity.verifiedEvidenceUrl,
        trackSlugs: activity.trackSlugs.filter((slug) =>
          publicTracks.has(slug),
        ),
        projectSlugs: activity.projectSlugs.filter((slug) =>
          publicProjects.has(slug),
        ),
      };
    });
  const linked = new Set(
    activities.map((activity) => activity.blogSlug).filter(Boolean),
  );
  const article = (post: ManagedPost): Activity => ({
    slug: `article-${post.slug}`,
    title: post.title,
    description: post.description,
    content: post.content,
    type: "article",
    date: post.publishedAt,
    updatedAt: post.updatedAt,
    status: "published",
    visibility: "public",
    sample: false,
    completion: "completed",
    trackSlugs: Array.isArray(post.frontmatter.trackSlugs)
      ? post.frontmatter.trackSlugs.filter(
          (value): value is string =>
            typeof value === "string" && publicTracks.has(value),
        )
      : [],
    projectSlugs: Array.isArray(post.frontmatter.projectSlugs)
      ? post.frontmatter.projectSlugs.filter(
          (value): value is string =>
            typeof value === "string" && publicProjects.has(value),
        )
      : [],
    technologies: [],
    tags: [],
    references: [],
    attachments: [],
    blogSlug: post.slug,
  });
  return [
    ...activities,
    ...posts.filter((post) => !linked.has(post.slug)).map(article),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
