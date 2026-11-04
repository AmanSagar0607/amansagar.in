import type { ManagedPost, ManagedProject } from "./content-types";

function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${name} must be an object`);
  return value as Record<string, unknown>;
}
function text(
  value: unknown,
  name: string,
  max: number,
  allowEmpty = false,
): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!allowEmpty && !value.trim())
  )
    throw new Error(`${name} must be text up to ${max} characters`);
  return value;
}
function slug(value: unknown) {
  const result = text(value, "Slug", 120);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result))
    throw new Error("Slug must contain lowercase letters, numbers and hyphens");
  return result;
}
function date(value: unknown, name: string) {
  const result = text(value, name, 40);
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(result) ||
    !Number.isFinite(Date.parse(result))
  )
    throw new Error(`${name} must be a valid date`);
}
function optionalUrl(value: unknown, name: string, allowLocal = false) {
  if (value === undefined || value === "") return;
  const url = text(value, name, 2048);
  if (
    allowLocal &&
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.includes("\\")
  )
    return;
  try {
    if (["http:", "https:"].includes(new URL(url).protocol)) return;
  } catch {
    /* Invalid URL. */
  }
  throw new Error(
    `${name} must use HTTP or HTTPS${allowLocal ? " or be a local path" : ""}`,
  );
}
function publishing(value: Record<string, unknown>) {
  if (value.status !== "draft" && value.status !== "published")
    throw new Error("Invalid publication status");
  if (value.visibility !== "public" && value.visibility !== "private")
    throw new Error("Invalid visibility");
}
function stringList(value: unknown, name: string) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > 100)
    throw new Error(`${name} must be a list of at most 100 items`);
  value.forEach((item) => text(item, name, 1000));
}
function technologyList(value: unknown, name: string, required = false) {
  if (value === undefined && !required) return;
  if (!Array.isArray(value) || value.length > 100)
    throw new Error(`${name} must be a list of at most 100 items`);
  for (const input of value) {
    const item = record(input, name);
    text(item.name, `${name} name`, 120);
    if (
      ![
        "frontend",
        "backend",
        "database",
        "devops",
        "design",
        "other",
      ].includes(String(item.category))
    )
      throw new Error(`Invalid ${name} category`);
    if (item.icon !== undefined) text(item.icon, `${name} icon`, 2048, true);
  }
}
export function validateManagedPost(input: unknown): ManagedPost {
  const post = record(input, "Post");
  slug(post.slug);
  text(post.title, "Title", 200);
  text(post.description, "Description", 1000);
  text(post.content, "Content", 100000);
  date(post.publishedAt, "Publication date");
  date(post.updatedAt, "Updated date");
  if (post.version !== undefined && (!Number.isInteger(post.version) || Number(post.version) < 1)) throw new Error("Invalid content version");
  publishing(post);
  if (post.sample !== undefined && typeof post.sample !== "boolean")
    throw new Error("Sample flag must be boolean");
  const meta = record(post.frontmatter, "Frontmatter");
  if (meta.image !== undefined) optionalUrl(meta.image, "Cover image", true);
  if (meta.tags !== undefined) stringList(meta.tags, "Tags");
  if (meta.keywords !== undefined) stringList(meta.keywords, "Keywords");
  if (meta.trackSlugs !== undefined) stringList(meta.trackSlugs, "Track links");
  if (meta.projectSlugs !== undefined)
    stringList(meta.projectSlugs, "Project links");
  for (const field of [
    "author",
    "category",
    "readTime",
    "seoTitle",
    "seoDescription",
  ])
    if (meta[field] !== undefined) text(meta[field], field, 1000, true);
  if (JSON.stringify(meta).length > 50000)
    throw new Error("Frontmatter is too large");
  return input as ManagedPost;
}
export function validateManagedProject(input: unknown): ManagedProject {
  const item = record(input, "Project");
  const id = slug(item.slug);
  publishing(item);
  date(item.updatedAt, "Updated date");
  if (item.version !== undefined && (!Number.isInteger(item.version) || Number(item.version) < 1)) throw new Error("Invalid content version");
  if (item.pinned !== undefined && typeof item.pinned !== "boolean") throw new Error("Invalid project pin");
  const project = record(item.project, "Project details");
  if (project.slug !== undefined && project.slug !== id)
    throw new Error("Project slug does not match its record");
  text(project.title, "Title", 200);
  text(project.description, "Description", 1000);
  text(project.overview, "Overview", 10000);
  date(project.date, "Project date");
  for (const field of ["src", "link"] as const) {
    text(project[field], field, 2048, true);
    optionalUrl(project[field], field, field === "src");
  }
  optionalUrl(project.githubUrl, "GitHub URL");
  for (const field of ["process", "features", "challenges", "learnings"])
    stringList(project[field], field);
  technologyList(project.technologies, "Technologies", true);
  technologyList(project.developmentTools, "Development tools");
  technologyList(project.designTools, "Design tools");
  if (project.deployment !== undefined) {
    const deploy = record(project.deployment, "Deployment");
    text(deploy.platform, "Deployment platform", 120);
    optionalUrl(deploy.url, "Deployment URL");
  }
  return input as ManagedProject;
}
export function isPublicContent(
  item: {
    status: string;
    visibility: string;
    publishedAt?: string;
    sample?: boolean;
  },
  now = Date.now(),
): boolean {
  return (
    item.status === "published" &&
    item.visibility === "public" &&
    item.sample !== true &&
    (!item.publishedAt ||
      (Number.isFinite(Date.parse(item.publishedAt)) &&
        Date.parse(item.publishedAt) <= now))
  );
}
