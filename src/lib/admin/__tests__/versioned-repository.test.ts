import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { ContentConflictError, ContentService } from "../content-service";
import {
  ContentNotInitializedError,
  VersionedContentRepository,
  type VersionedSnapshotStore,
} from "../versioned-repository";
import type { InitialContentSnapshot, ManagedPost } from "../content-types";
function store(): VersionedSnapshotStore & {
  current: () => InitialContentSnapshot | null;
} {
  let revision = 0;
  let state: InitialContentSnapshot | null = null;
  return {
    current: () => state && structuredClone(state),
    async load() {
      await Promise.resolve();
      return state
        ? { revision: String(revision), content: structuredClone(state) }
        : null;
    },
    async insertIfAbsent(input) {
      if (state) return false;
      state = structuredClone(input);
      revision++;
      return true;
    },
    async compareAndSwap(expected, input) {
      await Promise.resolve();
      if (!state || String(revision) !== expected) return false;
      state = structuredClone(input);
      revision++;
      return true;
    },
  };
}
function post(slug: string): ManagedPost {
  return {
    slug,
    title: slug,
    description: "Description",
    content: "Body",
    publishedAt: "2025-01-01",
    updatedAt: "2025-01-01",
    status: "draft",
    visibility: "private",
    frontmatter: {},
  };
}
describe("versioned CMS persistence contract", () => {
  it("initializes once and never overwrites existing data", async () => {
    const storage = store();
    const repo = new VersionedContentRepository(storage);
    const source = await createInitialContentSnapshot();
    await expect(repo.read()).rejects.toBeInstanceOf(
      ContentNotInitializedError,
    );
    expect(await repo.initialize(source, async () => {})).toBe(true);
    const alternate = structuredClone(source);
    alternate.posts = [];
    expect(await repo.initialize(alternate, async () => {})).toBe(false);
    expect(storage.current()?.posts).toHaveLength(source.posts.length);
  });
  it("rejects unauthorized initialization before writing", async () => {
    const storage = store();
    const repo = new VersionedContentRepository(storage);
    const source = await createInitialContentSnapshot();
    await expect(
      repo.initialize(source, async () => {
        throw new Error("Unauthorized");
      }),
    ).rejects.toThrow("Unauthorized");
    expect(storage.current()).toBeNull();
  });
  it("rejects duplicate migration IDs before touching storage", async () => {
    const storage = store();
    const repo = new VersionedContentRepository(storage);
    const source = await createInitialContentSnapshot();
    source.posts.push({ ...source.posts[0] });
    await expect(repo.initialize(source, async () => {})).rejects.toThrow(
      "Duplicate post",
    );
    expect(storage.current()).toBeNull();
  });
  it("retries concurrent mutations without losing either change", async () => {
    const storage = store();
    const repo = new VersionedContentRepository(storage);
    await repo.initialize(await createInitialContentSnapshot(), async () => {});
    const service = new ContentService(repo, async () => {});
    await Promise.all([
      service.savePost(post("concurrent-one")),
      service.savePost(post("concurrent-two")),
    ]);
    const slugs = (await repo.read()).posts.map((item) => item.slug);
    expect(slugs).toEqual(
      expect.arrayContaining(["concurrent-one", "concurrent-two"]),
    );
  });
  it("reports a conflict after bounded retries and leaves stored data untouched", async () => {
    const storage = store();
    const repo = new VersionedContentRepository(storage, 2);
    await repo.initialize(await createInitialContentSnapshot(), async () => {});
    const before = storage.current();
    storage.compareAndSwap = async () => false;
    const service = new ContentService(repo, async () => {});
    await expect(
      service.savePost(post("never-committed")),
    ).rejects.toBeInstanceOf(ContentConflictError);
    expect(storage.current()).toEqual(before);
  });
});
