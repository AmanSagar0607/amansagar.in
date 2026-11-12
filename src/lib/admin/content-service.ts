import { publicJourneyActivities } from "./public-journey";
import { validateSiteSettings, type SiteSettings } from "./site-settings";
import type {
  Activity,
  BadgeRule,
  Challenge,
  Track,
} from "@/lib/journey/types";
import { isPublicActivity, reconcileAwards } from "@/lib/journey/logic";
import { validateJourney } from "@/lib/journey/validation";
import type {
  InitialContentSnapshot,
  ManagedApp,
  ManagedPage,
  ManagedPost,
  ManagedProject,
} from "./content-types";
import {
  isPublicContent,
  validateManagedPost,
  validateManagedApp,
  validateManagedPage,
  validateManagedProject,
} from "./validation";

/** Implementations must lock or use a serializable transaction, rolling back on errors. */
export interface ContentTransactionRepository {
  read(): Promise<InitialContentSnapshot>;
  transact<T>(
    operation: (snapshot: InitialContentSnapshot) => {
      snapshot: InitialContentSnapshot;
      result: T;
    },
  ): Promise<T>;
}
/** Must verify a server-side session and the user's admin entitlement on every call. */
export type RequireAdmin = () => Promise<void>;
export type JourneyCollection =
  | "activities"
  | "tracks"
  | "challenges"
  | "badgeRules";
type JourneyRecord = Activity | Track | Challenge | BadgeRule;

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}
function validate<T>(operation: () => T): T {
  try {
    return operation();
  } catch (error) {
    if (
      error instanceof ContentConflictError ||
      error instanceof ContentNotFoundError
    )
      throw error;
    throw new ContentValidationError(
      error instanceof Error ? error.message : "Invalid content.",
    );
  }
}
export class ContentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentConflictError";
  }
}
export class ContentNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentNotFoundError";
  }
}
function clone<T>(input: T): T {
  return structuredClone(input);
}
function identity(collection: JourneyCollection, item: JourneyRecord): string {
  return collection === "activities" || collection === "tracks"
    ? (item as Activity | Track).slug
    : (item as Challenge | BadgeRule).id;
}
function replaceRecord<T>(
  rows: T[],
  item: T,
  getId: (entry: T) => string,
  previousId?: string,
): T[] {
  const id = getId(item);
  if (previousId !== undefined && previousId !== id)
    throw new ContentConflictError(
      "Changing an existing identifier requires updating related links; create a new record instead.",
    );
  const existing = rows.findIndex((row) => getId(row) === id);
  if (previousId !== undefined && existing === -1)
    throw new ContentNotFoundError("Content no longer exists.");
  if (previousId === undefined && existing !== -1)
    throw new ContentConflictError(
      "Content with this identifier already exists.",
    );
  if (existing === -1) return [...rows, item];
  return rows.map((row, index) => (index === existing ? item : row));
}
function updateAwards(snapshot: InitialContentSnapshot): void {
  snapshot.journey.awards = reconcileAwards({
    ...snapshot.journey,
    activities: publicJourneyActivities(snapshot),
  }).awards;
}
export function validateReferences(snapshot: InitialContentSnapshot): void {
  const projects = new Set(snapshot.projects.map((item) => item.slug));
  const tracks = new Set(snapshot.journey.tracks.map((item) => item.slug));
  for (const post of snapshot.posts) {
    for (const [field, allowed] of [
      ["projectSlugs", projects],
      ["trackSlugs", tracks],
    ] as const) {
      const refs = post.frontmatter[field];
      if (
        refs !== undefined &&
        (!Array.isArray(refs) ||
          refs.some((ref) => typeof ref !== "string" || !allowed.has(ref)))
      )
        throw new ContentConflictError(
          `Post ${post.slug} has an unknown ${field} relationship.`,
        );
    }
  }
  validate(() =>
    validateJourney(
      snapshot.journey,
      snapshot.projects.map((project) => project.slug),
      snapshot.posts.map((post) => post.slug),
    ),
  );
  for (const activity of snapshot.journey.activities) {
    if (
      isPublicActivity(activity) &&
      activity.blogSlug &&
      !snapshot.posts.some(
        (post) => post.slug === activity.blogSlug && isPublicContent(post),
      )
    ) {
      throw new ContentConflictError(
        "A public article activity must link to a published public blog post.",
      );
    }
  }
}
function assertPresent<T>(rows: T[], getId: (row: T) => string, id: string) {
  if (!rows.some((row) => getId(row) === id))
    throw new ContentNotFoundError("Content no longer exists.");
}

/** Database-neutral domain operations; repositories are responsible for durable atomic writes. */
export class ContentService {
  constructor(
    private readonly repository: ContentTransactionRepository,
    private readonly requireAdmin: RequireAdmin,
  ) {}
  async authorize(): Promise<void> {
    await this.requireAdmin();
  }
  async readAdmin(): Promise<InitialContentSnapshot> {
    await this.requireAdmin();
    return clone(await this.repository.read());
  }
  async saveSettings(input: unknown): Promise<SiteSettings> {
    await this.requireAdmin();
    const settings = validate(() => validateSiteSettings(input));
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      next.settings = settings;
      return { snapshot: next, result: settings };
    });
  }
  async savePost(input: unknown, previousSlug?: string): Promise<ManagedPost> {
    await this.requireAdmin();
    const post = validate(() => validateManagedPost(input));
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      const previous = next.posts.find((row) => row.slug === post.slug);
      const timestamp = new Date().toISOString();
      const version = (previous?.version ?? 0) + 1;
      const saved = { ...clone(post), version, updatedAt: timestamp, history: [...(previous?.history ?? []), { version, updatedAt: timestamp, summary: previous ? "Updated post" : "Created post" }].slice(-20) };
      next.posts = replaceRecord(
        next.posts,
        saved,
        (row) => row.slug,
        previousSlug,
      );
      validateReferences(next);
      updateAwards(next);
      return { snapshot: next, result: saved };
    });
  }
  async deletePost(slug: string): Promise<void> {
    await this.requireAdmin();
    return this.repository.transact((snapshot) => {
      assertPresent(snapshot.posts, (item) => item.slug, slug);
      if (
        snapshot.journey.activities.some(
          (activity) => activity.blogSlug === slug,
        )
      )
        throw new ContentConflictError(
          "Remove this article from related journey activities before deleting it.",
        );
      const next = clone(snapshot);
      next.posts = next.posts.filter((post) => post.slug !== slug);
      validateReferences(next);
      return { snapshot: next, result: undefined };
    });
  }
  async savePage(input: unknown, previousSlug?: string): Promise<ManagedPage> {
    await this.requireAdmin();
    const page = validate(() => validateManagedPage(input));
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      const rows = next.pages ?? [];
      const previous = rows.find((row) => row.slug === page.slug);
      const timestamp = new Date().toISOString();
      const version = (previous?.version ?? 0) + 1;
      const saved: ManagedPage = {
        ...clone(page),
        version,
        updatedAt: timestamp,
        history: [...(previous?.history ?? []), {
          version,
          updatedAt: timestamp,
          summary: previous ? "Updated page" : "Created page",
        }].slice(-20),
      };
      next.pages = replaceRecord(rows, saved, (row) => row.slug, previousSlug);
      return { snapshot: next, result: saved };
    });
  }
  async saveApp(input: unknown, previousSlug?: string): Promise<ManagedApp> {
    await this.requireAdmin();
    const app = validate(() => validateManagedApp(input));
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      const rows = next.apps ?? [];
      const previous = rows.find((row) => row.slug === app.slug);
      const timestamp = new Date().toISOString();
      const pages = app.pages.map((page) => {
        const previousPage = previous?.pages.find((row) => row.slug === page.slug);
        const version = (previousPage?.version ?? 0) + 1;
        return {
          ...clone(page),
          version,
          updatedAt: timestamp,
          history: [...(previousPage?.history ?? []), {
            version,
            updatedAt: timestamp,
            summary: previousPage ? "Updated app page" : "Created app page",
          }].slice(-20),
        };
      });
      const version = (previous?.version ?? 0) + 1;
      const saved: ManagedApp = {
        ...clone(app),
        pages,
        version,
        updatedAt: timestamp,
        history: [...(previous?.history ?? []), {
          version,
          updatedAt: timestamp,
          summary: previous ? "Updated app" : "Created app",
        }].slice(-20),
      };
      next.apps = replaceRecord(rows, saved, (row) => row.slug, previousSlug);
      return { snapshot: next, result: saved };
    });
  }
  async deleteApp(slug: string): Promise<void> {
    await this.requireAdmin();
    return this.repository.transact((snapshot) => {
      const rows = snapshot.apps ?? [];
      assertPresent(rows, (item) => item.slug, slug);
      const next = clone(snapshot);
      next.apps = rows.filter((app) => app.slug !== slug);
      return { snapshot: next, result: undefined };
    });
  }
  async deletePage(slug: string): Promise<void> {
    await this.requireAdmin();
    return this.repository.transact((snapshot) => {
      const rows = snapshot.pages ?? [];
      assertPresent(rows, (item) => item.slug, slug);
      const next = clone(snapshot);
      next.pages = rows.filter((page) => page.slug !== slug);
      return { snapshot: next, result: undefined };
    });
  }
  async saveProject(
    input: unknown,
    previousSlug?: string,
  ): Promise<ManagedProject> {
    await this.requireAdmin();
    const item = validate(() => validateManagedProject(input));
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      if (next.projects.some((project) => project.sortOrder === undefined)) {
        next.projects = next.projects
          .map((project, index) => ({ project, index }))
          .sort((a, b) => {
            const pinOrder = Number(b.project.pinned === true) - Number(a.project.pinned === true);
            if (pinOrder) return pinOrder;
            if (a.project.sortOrder !== undefined && b.project.sortOrder !== undefined)
              return a.project.sortOrder - b.project.sortOrder;
            const dateOrder = Date.parse(b.project.project.date) - Date.parse(a.project.project.date);
            return dateOrder || a.index - b.index;
          })
          .map(({ project }, sortOrder) => ({ ...project, sortOrder }));
      }
      const previous = next.projects.find((row) => row.slug === item.slug);
      const previousPosition = next.projects.findIndex((row) => row.slug === item.slug);
      const sortOrder = previous
        ? previous.sortOrder ?? previousPosition
        : 0;
      if (!previous) {
        next.projects = next.projects.map((row, index) => ({
          ...row,
          sortOrder: (row.sortOrder ?? index) + 1,
        }));
      }
      const timestamp = new Date().toISOString();
      const version = (previous?.version ?? 0) + 1;
      const saved = { ...clone(item), sortOrder, version, updatedAt: timestamp, history: [...(previous?.history ?? []), { version, updatedAt: timestamp, summary: previous ? "Updated project" : "Created project" }].slice(-20) };
      next.projects = replaceRecord(
        next.projects,
        saved,
        (row) => row.slug,
        previousSlug,
      );
      validateReferences(next);
      updateAwards(next);
      return { snapshot: next, result: saved };
    });
  }
  async reorderProjects(input: unknown): Promise<void> {
    await this.requireAdmin();
    const slugs = validate(() => {
      if (!Array.isArray(input) || input.length > 500)
        throw new Error("Project order must be a list of at most 500 slugs.");
      const values = input.map((value) => {
        if (
          typeof value !== "string" ||
          value.length > 120 ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        )
          throw new Error("Project order contains an invalid slug.");
        return value;
      });
      if (new Set(values).size !== values.length)
        throw new Error("Project order contains duplicate slugs.");
      return values;
    });
    await this.repository.transact((snapshot) => {
      const currentSlugs = snapshot.projects.map((project) => project.slug);
      if (
        currentSlugs.length !== slugs.length ||
        currentSlugs.some((slug) => !slugs.includes(slug))
      )
        throw new ContentConflictError(
          "Projects changed while you were editing the order. Reload and try again.",
        );
      const bySlug = new Map(snapshot.projects.map((project) => [project.slug, project]));
      const next = clone(snapshot);
      next.projects = slugs.map((slug, sortOrder) => ({
        ...bySlug.get(slug)!,
        sortOrder,
      }));
      return { snapshot: next, result: undefined };
    });
  }
  async deleteProject(slug: string): Promise<void> {
    await this.requireAdmin();
    return this.repository.transact((snapshot) => {
      assertPresent(snapshot.projects, (item) => item.slug, slug);
      if (
        snapshot.posts.some(
          (post) =>
            Array.isArray(post.frontmatter.projectSlugs) &&
            post.frontmatter.projectSlugs.includes(slug),
        ) ||
        snapshot.journey.tracks.some((track) =>
          track.projectSlugs.includes(slug),
        ) ||
        snapshot.journey.activities.some((activity) =>
          activity.projectSlugs.includes(slug),
        )
      )
        throw new ContentConflictError(
          "Remove this project from related tracks and activities before deleting it.",
        );
      const next = clone(snapshot);
      next.projects = next.projects.filter((project) => project.slug !== slug);
      validateReferences(next);
      return { snapshot: next, result: undefined };
    });
  }
  async saveJourneyRecord(
    collection: JourneyCollection,
    input: unknown,
    previousId?: string,
  ): Promise<JourneyRecord> {
    await this.requireAdmin();
    if (
      !["activities", "tracks", "challenges", "badgeRules"].includes(collection)
    )
      throw new ContentValidationError("Invalid content collection.");
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new ContentValidationError("Content must be an object.");
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      const candidate = clone(input) as JourneyRecord;
      if (collection === "activities")
        (candidate as Activity).updatedAt = new Date().toISOString();
      const id = identity(collection, candidate);
      if (typeof id !== "string" || !id)
        throw new ContentValidationError("Content requires an identifier.");
      const rows = next.journey[collection] as JourneyRecord[];
      const updated = replaceRecord(
        rows,
        candidate,
        (item) => identity(collection, item),
        previousId,
      );
      if (collection === "activities")
        next.journey.activities = updated as Activity[];
      else if (collection === "tracks")
        next.journey.tracks = updated as Track[];
      else if (collection === "challenges")
        next.journey.challenges = updated as Challenge[];
      else next.journey.badgeRules = updated as BadgeRule[];
      validateReferences(next);
      updateAwards(next);
      return { snapshot: next, result: candidate };
    });
  }
  async deleteJourneyRecord(
    collection: JourneyCollection,
    id: string,
  ): Promise<void> {
    await this.requireAdmin();
    if (
      !["activities", "tracks", "challenges", "badgeRules"].includes(collection)
    )
      throw new Error("Invalid content collection.");
    return this.repository.transact((snapshot) => {
      const next = clone(snapshot);
      const rows = next.journey[collection] as JourneyRecord[];
      assertPresent(rows, (item) => identity(collection, item), id);
      if (
        collection === "activities" &&
        (next.journey.tracks.some((track) =>
          track.milestones.some((milestone) => milestone.activitySlug === id),
        ) ||
          next.journey.challenges.some(
            (challenge) => challenge.activitySlug === id,
          ))
      )
        throw new ContentConflictError(
          "Remove this activity from related milestones and challenges before deleting it.",
        );
      if (
        collection === "tracks" &&
        (next.journey.activities.some((activity) =>
          activity.trackSlugs.includes(id),
        ) ||
          next.posts.some(
            (post) =>
              Array.isArray(post.frontmatter.trackSlugs) &&
              post.frontmatter.trackSlugs.includes(id),
          ))
      )
        throw new ContentConflictError(
          "Remove this track from related activities before deleting it.",
        );
      const remaining = rows.filter(
        (item) => identity(collection, item) !== id,
      );
      if (collection === "activities")
        next.journey.activities = remaining as Activity[];
      else if (collection === "tracks")
        next.journey.tracks = remaining as Track[];
      else if (collection === "challenges")
        next.journey.challenges = remaining as Challenge[];
      else {
        if (next.journey.awards.some((award) => award.badgeId === id))
          throw new ContentConflictError(
            "An earned achievement rule cannot be deleted.",
          );
        next.journey.badgeRules = remaining as BadgeRule[];
      }
      validateReferences(next);
      updateAwards(next);
      return { snapshot: next, result: undefined };
    });
  }
}
