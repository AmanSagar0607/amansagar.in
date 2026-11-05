import "server-only";
import { badgeDates } from "@/lib/journey/logic";
import type { MDXFile } from "@/lib/mdx-utils";
import type { Project } from "@/types/project";
import type { InitialContentSnapshot, ManagedPage, ManagedPost } from "./content-types";
import { projectPublicSnapshot } from "./public-snapshot";

export type PublicManagedPost = MDXFile & { format: "markdown" };
function validSlug(slug: string) {
  return slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
function asPost(post: ManagedPost): PublicManagedPost {
  return {
    slug: post.slug,
    content: post.content,
    format: "markdown",
    frontmatter: {
      ...post.frontmatter,
      title: post.title,
      description: post.description,
      date: post.publishedAt,
      updatedAt: post.updatedAt,
    },
  };
}
/** Server-only adapter. `readSnapshot` must be bound to the selected durable store, never to browser-supplied data. */
export function createPublicContentAdapter(
  readSnapshot: () => Promise<InitialContentSnapshot>,
) {
  async function read() {
    return projectPublicSnapshot(await readSnapshot());
  }
  return {
    async settings() {
      return (await read()).settings;
    },
    async pages(): Promise<ManagedPage[]> {
      return (await read()).pages;
    },
    async page(slug: string): Promise<ManagedPage | undefined> {
      if (!validSlug(slug)) return undefined;
      return (await read()).pages.find((page) => page.slug === slug);
    },
    async posts(): Promise<PublicManagedPost[]> {
      return (await read()).posts
        .map(asPost)
        .sort(
          (a, b) =>
            Date.parse(String(b.frontmatter.date)) -
            Date.parse(String(a.frontmatter.date)),
        );
    },
    async post(slug: string): Promise<PublicManagedPost | null> {
      if (!validSlug(slug)) return null;
      const post = (await read()).posts.find((item) => item.slug === slug);
      return post ? asPost(post) : null;
    },
    async projects(): Promise<Project[]> {
      return (await read()).projects.map((item) => item.project);
    },
    async project(slug: string): Promise<Project | undefined> {
      if (!validSlug(slug)) return undefined;
      return (await read()).projects.find((item) => item.slug === slug)
        ?.project;
    },
    async activities() {
      return (await read()).journey.activities;
    },
    async tracks() {
      return (await read()).journey.tracks;
    },
    async challenges() {
      return (await read()).journey.challenges;
    },
    async achievements() {
      const journey = (await read()).journey;
      return journey.badgeRules.map((rule) => ({
        ...rule,
        current: badgeDates(journey, rule.metric).length,
        earnedAt: journey.awards.find((award) => award.badgeId === rule.id)
          ?.earnedAt,
      }));
    },
  };
}
