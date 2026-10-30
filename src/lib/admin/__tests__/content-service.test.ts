import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import {
  ContentService,
  ContentConflictError,
  ContentNotFoundError,
  type ContentTransactionRepository,
} from "../content-service";
import type { InitialContentSnapshot, ManagedPost } from "../content-types";

function repository(
  initial: InitialContentSnapshot,
): ContentTransactionRepository & {
  current(): InitialContentSnapshot;
  calls: number;
} {
  let state = structuredClone(initial);
  return {
    calls: 0,
    current: () => structuredClone(state),
    async read() {
      this.calls++;
      return structuredClone(state);
    },
    async transact(operation) {
      this.calls++;
      const { snapshot, result } = operation(structuredClone(state));
      state = structuredClone(snapshot);
      return structuredClone(result);
    },
  };
}
function newPost(): ManagedPost {
  return {
    slug: "fresh-note",
    title: "Fresh note",
    description: "A new note",
    content: "Real content",
    publishedAt: "2025-01-01",
    updatedAt: "2025-01-01",
    status: "draft",
    visibility: "private",
    frontmatter: {},
  };
}
describe("content management domain operations", () => {
  it("requires verified admin access before reading, validating or writing", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {
      throw new Error("Unauthorized");
    });
    await expect(service.readAdmin()).rejects.toThrow("Unauthorized");
    await expect(service.savePost({})).rejects.toThrow("Unauthorized");
    await expect(service.deletePost("missing")).rejects.toThrow("Unauthorized");
    expect(store.calls).toBe(0);
  });
  it("creates, updates and deletes posts, rejects duplicates and keeps original slugs", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {});
    const post = newPost();
    await service.savePost(post);
    expect(
      store.current().posts.find((item) => item.slug === post.slug)?.visibility,
    ).toBe("private");
    await expect(service.savePost(post)).rejects.toBeInstanceOf(
      ContentConflictError,
    );
    await service.savePost(
      { ...post, status: "published", visibility: "public" },
      post.slug,
    );
    expect(
      store.current().posts.find((item) => item.slug === post.slug)?.status,
    ).toBe("published");
    expect(
      store
        .current()
        .journey.awards.find((award) => award.badgeId === "first-article"),
    ).toBeDefined();
    await expect(
      service.savePost({ ...post, slug: "renamed" }, post.slug),
    ).rejects.toBeInstanceOf(ContentConflictError);
    await service.deletePost(post.slug);
    expect(store.current().posts.some((item) => item.slug === post.slug)).toBe(
      false,
    );
    await expect(service.deletePost(post.slug)).rejects.toBeInstanceOf(
      ContentNotFoundError,
    );
  });
  it("blocks deletion of content used by existing journey records and rolls back", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {});
    const before = store.current();
    await expect(
      service.deleteJourneyRecord("tracks", "document-intelligence-ocr"),
    ).rejects.toBeInstanceOf(ContentConflictError);
    expect(store.current()).toEqual(before);
    const activity = before.journey.activities[0];
    await service.saveJourneyRecord("challenges", {
      id: "linked-challenge",
      title: "Review",
      category: "Research",
      description: "",
      visibility: "private",
      activitySlug: activity.slug,
    });
    await expect(
      service.deleteJourneyRecord("activities", activity.slug),
    ).rejects.toBeInstanceOf(ContentConflictError);
    expect(
      store.current().journey.activities.some((a) => a.slug === activity.slug),
    ).toBe(true);
  });
  it("does not allow a public article activity to point to a private post", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {});
    await service.savePost(newPost());
    const activity = {
      ...store.current().journey.activities[0],
      slug: "linked-article",
      type: "article",
      blogSlug: "fresh-note",
      sample: false,
      status: "published",
      visibility: "public",
      date: "2025-01-01",
    };
    await expect(
      service.saveJourneyRecord("activities", activity),
    ).rejects.toThrow("published public blog post");
    expect(
      store
        .current()
        .journey.activities.some((a) => a.slug === "linked-article"),
    ).toBe(false);
  });
  it("validates challenge evidence and prevents clients from directly granting awards", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {});
    await expect(
      service.saveJourneyRecord("challenges", {
        id: "invalid",
        title: "Read",
        category: "Learning",
        description: "",
        visibility: "public",
        completedAt: "2025-01-01",
      }),
    ).rejects.toThrow("requires evidence");
    await expect(
      service.saveJourneyRecord("awards" as never, {
        id: "fake",
        badgeId: "builder",
        earnedAt: "2025-01-01",
      }),
    ).rejects.toThrow("Invalid content collection");
    expect(store.current().journey.awards).toEqual([]);
  });
  it("validates post relationships and protects referenced projects", async () => {
    const store = repository(await createInitialContentSnapshot());
    const service = new ContentService(store, async () => {});
    const firstProject = store.current().projects[0];
    const item = {
      ...newPost(),
      frontmatter: { projectSlugs: [firstProject.slug] },
    };
    await service.savePost(item);
    await expect(service.deleteProject(firstProject.slug)).rejects.toThrow(
      "related",
    );
    await expect(
      service.savePost({
        ...newPost(),
        slug: "missing-link",
        frontmatter: { trackSlugs: ["missing"] },
      }),
    ).rejects.toThrow("unknown");
  });
});
