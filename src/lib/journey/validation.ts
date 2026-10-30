import { activityTypes, type JourneyData } from "./types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function validSlug(value: string): boolean {
  return slugPattern.test(value) && value.length <= 120;
}
export function safeUrl(value: string): boolean {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
// Validate at the file and HTTP boundaries; never trust parsed JSON as a TypeScript type.
export function validateJourney(
  input: unknown,
  projectSlugs: string[],
  blogSlugs: string[],
): JourneyData {
  function fail(message: string): never {
    throw new Error(message);
  }
  function object(v: unknown, label: string): Record<string, unknown> {
    if (!v || typeof v !== "object" || Array.isArray(v))
      fail(`${label} must be an object`);
    return v as Record<string, unknown>;
  }
  function list(v: unknown, label: string): unknown[] {
    if (!Array.isArray(v) || v.length > 2000)
      fail(`${label} must be an array (maximum 2000)`);
    return v;
  }
  function str(v: unknown, label: string, max = 500, empty = false): string {
    if (typeof v !== "string" || (!empty && !v.trim()) || v.length > max)
      fail(`${label} must be text, maximum ${max} characters`);
    return v;
  }
  function enumeration(v: unknown, values: readonly string[], label: string) {
    if (!values.includes(String(v))) fail(`Invalid ${label}`);
  }
  function strings(v: unknown, label: string) {
    return list(v, label).map((x) => str(x, label, 120));
  }
  function date(v: unknown, label: string) {
    const text = str(v, label, 40);
    if (
      !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) ||
      !Number.isFinite(Date.parse(text))
    )
      fail(`Invalid ${label}`);
  }
  function optionalDate(v: unknown, label: string) {
    if (v !== undefined && v !== "") date(v, label);
  }
  function url(v: unknown, label: string) {
    if (v !== undefined && v !== "" && !safeUrl(str(v, label, 2048)))
      fail(`${label} must be an http(s) URL`);
  }
  function slug(v: unknown, label: string) {
    if (!validSlug(str(v, label, 120))) fail(`Invalid ${label}`);
  }
  function unique(items: unknown[], field: string, label: string) {
    const keys = items.map((x) => object(x, label)[field]);
    if (new Set(keys).size !== keys.length) fail(`Duplicate ${label} ${field}`);
  }
  const root = object(input, "Journey");
  const activities = list(root.activities, "activities");
  const tracks = list(root.tracks, "tracks");
  const challenges = list(root.challenges, "challenges");
  const rules = list(root.badgeRules, "badgeRules");
  const awards = list(root.awards, "awards");
  unique(activities, "slug", "activity");
  unique(tracks, "slug", "track");
  unique(challenges, "id", "challenge");
  unique(rules, "id", "badge");
  unique(awards, "badgeId", "award");
  const linkedBlogs = activities
    .map((a) => object(a, "activity").blogSlug)
    .filter(Boolean);
  if (new Set(linkedBlogs).size !== linkedBlogs.length)
    fail("A blog article may only be linked once");
  const trackIds = tracks.map((t) => object(t, "track").slug);
  function projectLinks(v: unknown) {
    for (const id of strings(v, "projectSlugs"))
      if (!projectSlugs.includes(id)) fail(`Unknown project: ${id}`);
  }
  for (const item of activities) {
    const a = object(item, "Activity");
    slug(a.slug, "activity slug");
    str(a.title, "title", 200);
    str(a.description, "description", 1000);
    str(a.content, "content", 100000, true);
    enumeration(a.type, activityTypes, "activity type");
    enumeration(a.status, ["draft", "published"], "publication status");
    enumeration(a.visibility, ["public", "private"], "visibility");
    enumeration(
      a.completion,
      ["planned", "in-progress", "completed"],
      "completion",
    );
    if (typeof a.sample !== "boolean") fail("sample must be boolean");
    date(a.date, "publication date");
    date(a.updatedAt, "updated date");
    for (const id of strings(a.trackSlugs, "trackSlugs"))
      if (!trackIds.includes(id)) fail(`Unknown track: ${id}`);
    projectLinks(a.projectSlugs);
    strings(a.technologies, "technologies");
    strings(a.tags, "tags");
    for (const field of [
      "githubUrl",
      "demoUrl",
      "coverImage",
      "verifiedEvidenceUrl",
    ])
      url(a[field], field);
    for (const field of ["seoTitle", "seoDescription"])
      if (a[field] !== undefined) str(a[field], field, 1000, true);
    for (const field of ["references", "attachments"])
      for (const resource of list(a[field], field)) {
        const r = object(resource, field);
        str(r.title, "resource title");
        if (!safeUrl(str(r.url, "resource URL", 2048)))
          fail("Resource URL must use http(s)");
      }
    if (a.blogSlug !== undefined && a.blogSlug !== "") {
      slug(a.blogSlug, "blog slug");
      if (!blogSlugs.includes(String(a.blogSlug)))
        fail("Unknown or unpublished blog article");
    }
    if (a.type === "article" && !a.blogSlug)
      fail(
        "Articles must link an existing blog post; edit long-form content in src/content/posts",
      );
    if (a.milestoneKind !== undefined && a.milestoneKind !== "")
      enumeration(
        a.milestoneKind,
        ["project-shipped", "open-source"],
        "milestone kind",
      );
    if (
      a.status === "published" &&
      a.visibility === "public" &&
      !a.sample &&
      a.type !== "article" &&
      !String(a.content).trim()
    )
      fail("Public activities require detailed content");
    if (
      a.milestoneKind === "open-source" &&
      a.completion === "completed" &&
      !a.verifiedEvidenceUrl
    )
      fail(
        "Completed open-source milestones require a verified contribution URL",
      );
    if (
      a.milestoneKind === "project-shipped" &&
      a.completion === "completed" &&
      !(a.projectSlugs as string[]).length
    )
      fail("Shipped milestones require an existing project");
  }
  const publicActivities = activities.filter((item) => {
    const a = object(item, "activity");
    return (
      a.status === "published" &&
      a.visibility === "public" &&
      !a.sample &&
      Date.parse(String(a.date)) <= Date.now()
    );
  });
  function evidenceActivity(v: unknown) {
    return publicActivities.find((a) => object(a, "activity").slug === v);
  }
  for (const item of tracks) {
    const t = object(item, "Track");
    slug(t.slug, "track slug");
    if (t.slug === "activity") fail("Track slug activity is reserved");
    str(t.title, "track title", 200);
    str(t.description, "track description", 2000);
    enumeration(
      t.status,
      ["planned", "active", "paused", "on-break", "completed"],
      "track status",
    );
    enumeration(t.visibility, ["public", "private"], "track visibility");
    strings(t.technologies, "track technologies");
    optionalDate(t.startDate, "track start");
    projectLinks(t.projectSlugs);
    const milestones = list(t.milestones, "milestones");
    unique(milestones, "id", "milestone");
    for (const item of milestones) {
      const m = object(item, "milestone");
      slug(m.id, "milestone id");
      str(m.title, "milestone title");
      optionalDate(m.completedAt, "milestone completion");
      if (
        m.activitySlug &&
        !activities.some((a) => object(a, "activity").slug === m.activitySlug)
      )
        fail("Unknown milestone activity");
      if (
        m.completedAt &&
        (!evidenceActivity(m.activitySlug) ||
          Date.parse(String(m.completedAt)) > Date.now())
      )
        fail(
          "Completed milestones require a published public activity and a non-future completion date",
        );
    }
    if (
      t.status === "completed" &&
      (!milestones.length ||
        milestones.some((m) => !object(m, "milestone").completedAt))
    )
      fail("Complete every milestone before completing a track");
  }
  for (const item of challenges) {
    const c = object(item, "challenge");
    slug(c.id, "challenge id");
    str(c.title, "challenge title");
    str(c.category, "category", 100);
    str(c.description, "challenge description", 2000, true);
    enumeration(c.visibility, ["public", "private"], "challenge visibility");
    optionalDate(c.date, "challenge date");
    optionalDate(c.completedAt, "challenge completion");
    url(c.evidenceUrl, "evidence URL");
    if (
      c.activitySlug &&
      !activities.some((a) => object(a, "activity").slug === c.activitySlug)
    )
      fail("Unknown challenge activity");
    if (
      c.completedAt &&
      ((!c.evidenceUrl && !evidenceActivity(c.activitySlug)) ||
        Date.parse(String(c.completedAt)) > Date.now())
    )
      fail(
        "Challenge completion requires evidence or a published activity and a non-future date",
      );
  }
  for (const item of rules) {
    const r = object(item, "badge");
    slug(r.id, "badge id");
    str(r.title, "badge title");
    str(r.description, "badge description", 2000);
    str(r.requirement, "badge requirement", 1000);
    enumeration(
      r.metric,
      [
        "learning",
        "research",
        "building",
        "article",
        "active-days",
        "open-source",
        "project-shipped",
        "track",
      ],
      "badge metric",
    );
    if (
      !Number.isInteger(r.target) ||
      Number(r.target) < 1 ||
      Number(r.target) > 10000
    )
      fail("Badge target must be an integer from 1 to 10000");
  }
  for (const item of awards) {
    const a = object(item, "award");
    slug(a.badgeId, "award badge");
    date(a.earnedAt, "earned date");
  }
  return input as JourneyData;
}
