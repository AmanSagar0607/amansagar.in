import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import { createAdminGuard } from "../access-control";
import { createInitialContentSnapshot } from "../initial-snapshot";
import { ContentService } from "../content-service";
import { createContentRouteHandlers } from "../content-http";
import {
  loadContent,
  saveContent,
  deleteContent,
  AdminClientError,
} from "../client";
import {
  VersionedContentRepository,
  type VersionedSnapshotStore,
} from "../versioned-repository";
import { projectPublicSnapshot } from "../public-snapshot";
import type { InitialContentSnapshot, ManagedPost } from "../content-types";

const previousFetch = global.fetch;
afterEach(() => {
  global.fetch = previousFetch;
});
function memoryStore(): VersionedSnapshotStore {
  let revision = 0;
  let content: InitialContentSnapshot | null = null;
  return {
    async load() {
      return content
        ? { revision: String(revision), content: structuredClone(content) }
        : null;
    },
    async insertIfAbsent(value) {
      if (content) return false;
      content = structuredClone(value);
      revision++;
      return true;
    },
    async compareAndSwap(expected, value) {
      if (!content || String(revision) !== expected) return false;
      content = structuredClone(value);
      revision++;
      return true;
    },
  };
}
const post: ManagedPost = {
  slug: "test-complete-flow",
  title: "End-to-end note",
  description: "An update",
  content: "Actual technical content",
  publishedAt: "2025-01-01",
  updatedAt: "2025-01-01",
  status: "draft",
  visibility: "private",
  sample: false,
  frontmatter: { tags: ["Testing"] },
};
describe("admin request-to-publication workflow", () => {
  it("authenticates, saves private drafts, publishes, invalidates and deletes without leaking private content", async () => {
    const repository = new VersionedContentRepository(memoryStore());
    await repository.initialize(
      await createInitialContentSnapshot(),
      async () => {},
    );
    let signedIn = false;
    let invalidations = 0;
    const guard = createAdminGuard(
      async () => (signedIn ? { subject: "owner-id" } : null),
      ["owner-id"],
    );
    const handlers = createContentRouteHandlers({
      serviceFor: async (request) =>
        new ContentService(repository, async () => {
          await guard(request);
        }),
      revalidate: async () => {
        invalidations++;
      },
    });
    global.fetch = jest.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input), "https://portfolio.example");
      const headers = new Headers(init?.headers);
      headers.set("origin", url.origin);
      const request = new NextRequest(url, {
        method: init?.method,
        body: init?.body,
        headers,
      });
      const method = init?.method || "GET";
      if (method === "POST") return handlers.POST(request);
      if (method === "PUT") return handlers.PUT(request);
      if (method === "DELETE") return handlers.DELETE(request);
      return handlers.GET(request);
    });
    await expect(loadContent()).rejects.toBeInstanceOf(AdminClientError);
    signedIn = true;
    const created = await saveContent("post", post);
    expect(created.record.slug).toBe(post.slug);
    expect(
      (await loadContent()).posts.some((item) => item.slug === post.slug),
    ).toBe(true);
    expect(
      projectPublicSnapshot(await repository.read()).posts.some(
        (item) => item.slug === post.slug,
      ),
    ).toBe(false);
    await saveContent(
      "post",
      { ...created.record, status: "published", visibility: "public" },
      post.slug,
    );
    const published = projectPublicSnapshot(await repository.read());
    expect(published.posts.some((item) => item.slug === post.slug)).toBe(true);
    expect(
      published.journey.activities.some(
        (activity) => activity.blogSlug === post.slug,
      ),
    ).toBe(true);
    await deleteContent("post", post.slug);
    expect(
      projectPublicSnapshot(await repository.read()).posts.some(
        (item) => item.slug === post.slug,
      ),
    ).toBe(false);
    expect(invalidations).toBe(3);
    signedIn = false;
    await expect(loadContent()).rejects.toMatchObject({ status: 401 });
  });
});
