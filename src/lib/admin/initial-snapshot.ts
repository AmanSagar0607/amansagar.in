import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllProjects } from "@/lib/projects";
import { getJourney } from "@/lib/journey/store";
import type { InitialContentSnapshot, ManagedPost } from "./content-types";
import { defaultSiteSettings } from "./site-settings";

/** Read existing source records without writing to a database or altering the public site. */
export async function createInitialContentSnapshot(): Promise<InitialContentSnapshot> {
  const directory = path.join(process.cwd(), "src/content/posts");
  const files = (await fs.readdir(directory)).filter((file) =>
    file.endsWith(".mdx"),
  );
  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(
        await fs.readFile(path.join(directory, file), "utf8"),
      );
      const slug = file.slice(0, -4);
      const date =
        typeof data.date === "string"
          ? data.date
          : data.date instanceof Date
            ? data.date.toISOString()
            : "";
      if (!data.title || !date || !Number.isFinite(Date.parse(date)))
        throw new Error(
          `Post ${slug} is missing a title or valid publication date`,
        );
      const status =
        data.status === "draft" || data.published === false
          ? "draft"
          : "published";
      const visibility =
        data.visibility === "private" || data.sample === true
          ? "private"
          : "public";
      return {
        slug,
        title: String(data.title),
        description:
          typeof data.description === "string" ? data.description : "",
        content,
        publishedAt: date,
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : date,
        status,
        visibility,
        sample: data.sample === true,
        frontmatter: data,
      } satisfies ManagedPost;
    }),
  );
  const projects = getAllProjects().map((project) => {
    if (!project.slug) throw new Error(`Project ${project.title} has no slug`);
    return {
      slug: project.slug,
      status: "published" as const,
      visibility: "public" as const,
      updatedAt: project.date,
      project,
    };
  });
  return {
    posts,
    projects,
    journey: await getJourney(),
    settings: { ...defaultSiteSettings },
  };
}
