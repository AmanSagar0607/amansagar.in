import type { JourneyData } from "@/lib/journey/types";
import { reconcileAwards } from "@/lib/journey/logic";
import type {
  InitialContentSnapshot,
  ManagedPage,
  ManagedApp,
  ManagedPost,
  ManagedProject,
} from "./content-types";
import { isPublicContent } from "./validation";
import { publicJourneyActivities } from "./public-journey";
import {
  defaultSiteSettings,
  validateSiteSettings,
  type SiteSettings,
} from "./site-settings";

export interface PublicContentSnapshot {
  pages: ManagedPage[];
  apps: ManagedApp[];
  posts: ManagedPost[];
  projects: ManagedProject[];
  journey: JourneyData;
  settings: SiteSettings;
}
const allowedPostFields = [
  "author",
  "category",
  "readTime",
  "image",
  "tags",
  "seoTitle",
  "seoDescription",
  "keywords",
] as const;
/** Only selected metadata can cross the public boundary; private records and relationships are omitted. */
export function projectPublicSnapshot(
  snapshot: InitialContentSnapshot,
  now = Date.now(),
): PublicContentSnapshot {
  const publicTrackIds = new Set(
    snapshot.journey.tracks
      .filter((track) => track.visibility === "public")
      .map((track) => track.slug),
  );
  const publicProjectIds = new Set(
    snapshot.projects
      .filter((project) => isPublicContent(project, now))
      .map((project) => project.slug),
  );
  const posts = snapshot.posts
    .filter((post) => isPublicContent(post, now))
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      status: post.status,
      visibility: post.visibility,
      sample: post.sample,
      frontmatter: {
        ...Object.fromEntries(
          allowedPostFields
            .filter((key) => {
              const value = post.frontmatter[key];
              return key === "tags" || key === "keywords"
                ? Array.isArray(value) &&
                    value.every((item) => typeof item === "string")
                : typeof value === "string";
            })
            .map((key) => [key, post.frontmatter[key]]),
        ),
        ...(Array.isArray(post.frontmatter.trackSlugs)
          ? {
              trackSlugs: post.frontmatter.trackSlugs.filter(
                (slug): slug is string =>
                  typeof slug === "string" && publicTrackIds.has(slug),
              ),
            }
          : {}),
        ...(Array.isArray(post.frontmatter.projectSlugs)
          ? {
              projectSlugs: post.frontmatter.projectSlugs.filter(
                (slug): slug is string =>
                  typeof slug === "string" && publicProjectIds.has(slug),
              ),
            }
          : {}),
      },
    }));
  const pages = (snapshot.pages ?? [])
    .filter((page) => isPublicContent(page, now))
    .map((page) => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      content: page.content,
      status: page.status,
      visibility: page.visibility,
      updatedAt: page.updatedAt,
      navigationTitle: page.navigationTitle,
      showInNavigation: page.showInNavigation === true,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      image: page.image,
    }));
  const apps = (snapshot.apps ?? [])
    .filter((app) => isPublicContent(app, now))
    .map((app) => ({
      slug: app.slug,
      title: app.title,
      tagline: app.tagline,
      description: app.description,
      content: app.content,
      category: app.category,
      platform: app.platform,
      technologies: app.technologies,
      icon: app.icon,
      coverImage: app.coverImage,
      screenshots: app.screenshots,
      launchUrl: app.launchUrl,
      sourceUrl: app.sourceUrl,
      status: app.status,
      visibility: app.visibility,
      featured: app.featured,
      sortOrder: app.sortOrder,
      updatedAt: app.updatedAt,
      seoTitle: app.seoTitle,
      seoDescription: app.seoDescription,
      pages: app.pages
        .filter((page) => isPublicContent(page, now))
        .map((page) => ({
          slug: page.slug,
          title: page.title,
          description: page.description,
          content: page.content,
          status: page.status,
          visibility: page.visibility,
          updatedAt: page.updatedAt,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          image: page.image,
        })),
    }));
  const projects = snapshot.projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => isPublicContent(project, now))
    .sort((a, b) => {
      const pinnedOrder = Number(b.project.pinned === true) - Number(a.project.pinned === true);
      if (pinnedOrder) return pinnedOrder;
      if (a.project.sortOrder !== undefined && b.project.sortOrder !== undefined)
        return a.project.sortOrder - b.project.sortOrder;
      if (a.project.sortOrder !== undefined) return -1;
      if (b.project.sortOrder !== undefined) return 1;
      const dateOrder = Date.parse(b.project.project.date) - Date.parse(a.project.project.date);
      return dateOrder || a.index - b.index;
    })
    .map(({ project: item }) => {
      const p = item.project;
      const technologies = (items: typeof p.technologies) =>
        items.map(({ name, icon, category }) => ({ name, icon, category }));
      return {
        slug: item.slug,
        status: item.status,
        visibility: item.visibility,
        updatedAt: item.updatedAt,
        pinned: item.pinned === true,
        sortOrder: item.sortOrder,
        project: {
          slug: p.slug,
          pinned: item.pinned === true,
          title: p.title,
          description: p.description,
          src: p.src,
          link: p.link,
          technologies: technologies(p.technologies),
          overview: p.overview,
          process: p.process,
          date: p.date,
          githubUrl: p.githubUrl,
          features: p.features,
          challenges: p.challenges,
          learnings: p.learnings,
          designTools: p.designTools && technologies(p.designTools),
          developmentTools:
            p.developmentTools && technologies(p.developmentTools),
          deployment: p.deployment && {
            platform: p.deployment.platform,
            url: p.deployment.url,
          },
        },
      };
    });
  const activities = publicJourneyActivities(snapshot, now);
  const activitySlugs = new Set(activities.map((activity) => activity.slug));
  const projectSlugs = new Set(projects.map((project) => project.slug));
  const tracks = snapshot.journey.tracks
    .filter((track) => track.visibility === "public")
    .map((track) => ({
      slug: track.slug,
      title: track.title,
      description: track.description,
      technologies: track.technologies,
      startDate: track.startDate,
      status: track.status,
      visibility: track.visibility,
      projectSlugs: track.projectSlugs.filter((slug) => projectSlugs.has(slug)),
      milestones: track.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        completedAt: milestone.completedAt,
        activitySlug:
          milestone.activitySlug && activitySlugs.has(milestone.activitySlug)
            ? milestone.activitySlug
            : undefined,
      })),
    }));
  const challenges = snapshot.journey.challenges
    .filter((challenge) => challenge.visibility === "public")
    .map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      category: challenge.category,
      description: challenge.description,
      date: challenge.date,
      visibility: challenge.visibility,
      evidenceUrl: challenge.evidenceUrl,
      completedAt: challenge.completedAt,
      activitySlug:
        challenge.activitySlug && activitySlugs.has(challenge.activitySlug)
          ? challenge.activitySlug
          : undefined,
    }));
  const journey = reconcileAwards({
    activities,
    tracks,
    challenges,
    badgeRules: snapshot.journey.badgeRules.map(
      ({ id, title, description, requirement, metric, target }) => ({
        id,
        title,
        description,
        requirement,
        metric,
        target,
      }),
    ),
    awards: snapshot.journey.awards.map(({ badgeId, earnedAt }) => ({
      badgeId,
      earnedAt,
    })),
  });
  const settings = snapshot.settings
    ? validateSiteSettings(snapshot.settings)
    : { ...defaultSiteSettings };
  delete settings.releaseVersion;
  return structuredClone({ pages, apps, posts, projects, journey, settings });
}
