import type { ManagedApp, ManagedAppPage, ManagedPage, ManagedPost, ManagedProject } from "./content-types";

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
  if (item.sortOrder !== undefined && (!Number.isInteger(item.sortOrder) || Number(item.sortOrder) < 0)) throw new Error("Invalid project order");
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
const reservedPageSlugs = new Set([
  "about", "achievements", "admin", "api", "blog", "contact", "journey",
  "projects", "resume", "robots", "sitemap", "social", "opengraph-image",
]);
export function validateManagedPage(input: unknown): ManagedPage {
  const page = record(input, "Page");
  const id = slug(page.slug);
  if (reservedPageSlugs.has(id))
    throw new Error("That slug belongs to a built-in route. Choose a different slug.");
  text(page.title, "Title", 200);
  text(page.description, "Description", 1000, true);
  text(page.content, "Content", 100000, true);
  publishing(page);
  date(page.updatedAt, "Updated date");
  if (page.version !== undefined && (!Number.isInteger(page.version) || Number(page.version) < 1)) throw new Error("Invalid page version");
  for (const field of ["navigationTitle", "seoTitle", "seoDescription"])
    if (page[field] !== undefined) text(page[field], field, field === "navigationTitle" ? 80 : 200, true);
  if (page.showInNavigation !== undefined && typeof page.showInNavigation !== "boolean")
    throw new Error("Navigation visibility must be a boolean");
  if (page.image !== undefined) optionalUrl(page.image, "Cover image", true);
  return input as ManagedPage;
}
const reservedAppSlugs = new Set(["new", "api", "admin", "apps"]);
function validateManagedAppPage(input: unknown): ManagedAppPage {
  const page = record(input, "App page");
  const pagePath = text(page.slug, "App page path", 300);
  if (!pagePath.split("/").every((part) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part)))
    throw new Error("App page paths must use lowercase words, numbers and hyphens separated by slashes.");
  text(page.title, "App page title", 200);
  text(page.description, "App page description", 1000, true);
  text(page.content, "App page content", 100000, true);
  publishing(page);
  date(page.updatedAt, "App page updated date");
  if (page.version !== undefined && (!Number.isInteger(page.version) || Number(page.version) < 1)) throw new Error("Invalid app page version");
  for (const field of ["seoTitle", "seoDescription"])
    if (page[field] !== undefined) text(page[field], field, 200, true);
  if (page.image !== undefined) optionalUrl(page.image, "App page image", true);
  if (page.status === "published" && page.visibility === "public" && !String(page.content).trim())
    throw new Error("Add content before publishing an app page.");
  return input as ManagedAppPage;
}
export function validateManagedApp(input: unknown): ManagedApp {
  const app = record(input, "App");
  const id = slug(app.slug);
  if (reservedAppSlugs.has(id)) throw new Error("That slug is reserved. Choose a different app slug.");
  text(app.title, "App title", 200);
  text(app.tagline, "App tagline", 240, true);
  text(app.description, "App description", 1000);
  text(app.content, "App content", 100000, true);
  text(app.category, "App category", 80);
  if (!["web", "mobile", "desktop", "api", "other"].includes(String(app.platform)))
    throw new Error("Choose a valid app platform.");
  stringList(app.technologies, "Technologies");
  if (app.icon !== undefined) optionalUrl(app.icon, "App icon", true);
  if (app.coverImage !== undefined) optionalUrl(app.coverImage, "App cover", true);
  for (const field of ["launchUrl", "sourceUrl"] as const) {
    if (app[field] === undefined || app[field] === "") continue;
    const value = text(app[field], field, 2048);
    let url: URL;
    try { url = new URL(value); } catch { throw new Error(`${field} must be a valid HTTPS URL.`); }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error(`${field} must use HTTPS.`);
  }
  if (!Array.isArray(app.screenshots) || app.screenshots.length > 12)
    throw new Error("Add up to 12 app screenshots.");
  app.screenshots.forEach((url: unknown) => optionalUrl(url, "Screenshot", true));
  publishing(app);
  if (typeof app.featured !== "boolean") throw new Error("App featured state must be boolean.");
  if (!Number.isInteger(app.sortOrder) || Number(app.sortOrder) < 0) throw new Error("Invalid app order.");
  date(app.updatedAt, "App updated date");
  if (app.version !== undefined && (!Number.isInteger(app.version) || Number(app.version) < 1)) throw new Error("Invalid app version");
  for (const field of ["seoTitle", "seoDescription"])
    if (app[field] !== undefined) text(app[field], field, 200, true);
  if (!Array.isArray(app.pages) || app.pages.length > 50) throw new Error("An app can have up to 50 content pages.");
  const childSlugs = app.pages.map((page: unknown) => validateManagedAppPage(page).slug);
  if (new Set(childSlugs).size !== childSlugs.length) throw new Error("App page slugs must be unique within an app.");
  return input as ManagedApp;
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
