import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllProjects } from "@/lib/projects";
import { getMDXFiles } from "@/lib/mdx-utils";
import { badgeDates, isPublicActivity, reconcileAwards } from "./logic";
import { validateJourney } from "./validation";
import type { Activity, JourneyData } from "./types";

const directory = path.join(process.cwd(), "src/content/journey");
const filename = path.join(directory, "journey.json");

async function blogActivities(): Promise<Activity[]> {
  return (await getMDXFiles("src/content/posts")).map((post) => {
    const { content } = matter(post.content);
    const f = post.frontmatter;
    const date = String(f.date);
    return {
      slug: `article-${post.slug}`,
      title: String(f.title),
      description: String(f.description || ""),
      content,
      type: "article",
      date,
      updatedAt: String(f.updatedAt || date),
      status: "published",
      visibility: "public",
      sample: false,
      completion: "completed",
      trackSlugs: Array.isArray(f.trackSlugs) ? f.trackSlugs : [],
      projectSlugs: Array.isArray(f.projectSlugs) ? f.projectSlugs : [],
      technologies: Array.isArray(f.technologies) ? f.technologies : [],
      tags: Array.isArray(f.tags) ? f.tags : [],
      references: [],
      attachments: [],
      blogSlug: post.slug,
    } satisfies Activity;
  });
}
async function readSource(): Promise<JourneyData> {
  const input: unknown = JSON.parse(await fs.readFile(filename, "utf8"));
  return validateJourney(
    input,
    getAllProjects().flatMap((p) => (p.slug ? [p.slug] : [])),
    (await fs.readdir(path.join(process.cwd(), "src/content/posts")))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.slice(0, -4)),
  );
}
export async function getJourney(): Promise<JourneyData> {
  return readSource();
}

function publicActivities(data: JourneyData, blogs: Activity[]): Activity[] {
  const publicTrackIds = new Set(
    data.tracks.filter((t) => t.visibility === "public").map((t) => t.slug),
  );
  const linked = new Set(
    data.activities
      .filter(isPublicActivity)
      .filter((a) => a.blogSlug)
      .map((a) => a.blogSlug),
  );
  return [
    ...data.activities
      .filter(
        (a) =>
          isPublicActivity(a) &&
          (!a.blogSlug || blogs.some((b) => b.blogSlug === a.blogSlug)),
      )
      .map((a) => {
        const blog = a.blogSlug
          ? blogs.find((b) => b.blogSlug === a.blogSlug)
          : undefined;
        return blog
          ? {
              ...a,
              title: blog.title,
              description: blog.description,
              content: blog.content,
              date: blog.date,
              updatedAt: blog.updatedAt,
            }
          : a;
      }),
    ...blogs.filter((a) => !linked.has(a.blogSlug)),
  ]
    .map((a) => ({
      ...a,
      trackSlugs: a.trackSlugs.filter((id) => publicTrackIds.has(id)),
    }))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
export async function getPublicActivities(): Promise<Activity[]> {
  const data = await readSource();
  const blogs = await blogActivities();
  return publicActivities(data, blogs);
}
export async function getPublicTracks() {
  return (await readSource()).tracks.filter((t) => t.visibility === "public");
}
export async function getAchievements() {
  const data = await readSource();
  const publicData = reconcileAwards({
    ...data,
    activities: await getPublicActivities(),
  });
  return data.badgeRules.map((rule) => ({
    ...rule,
    current: badgeDates(publicData, rule.metric).length,
    earnedAt: publicData.awards.find((a) => a.badgeId === rule.id)?.earnedAt,
  }));
}

// Serialize local writes, use atomic rename, and calculate awards on the server.
let pending: Promise<unknown> = Promise.resolve();
export async function saveJourney(input: unknown): Promise<void> {
  const operation = pending.then(async () => {
    const data = validateJourney(
      input,
      getAllProjects().flatMap((p) => (p.slug ? [p.slug] : [])),
      (await getMDXFiles("src/content/posts")).map((p) => p.slug),
    );
    const old = await readSource();
    const blogs = await blogActivities();
    const calculated = reconcileAwards({
      ...data,
      awards: old.awards,
      activities: publicActivities(data, blogs),
    });
    const output = { ...data, awards: calculated.awards };
    const temporary = path.join(directory, `.journey-${process.pid}.tmp`);
    await fs.writeFile(
      temporary,
      JSON.stringify(output, null, 2) + "\n",
      "utf8",
    );
    await fs.rename(temporary, filename);
  });
  pending = operation.catch(() => undefined);
  await operation;
}
