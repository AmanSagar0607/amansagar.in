import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { createPublicContentAdapter } from "../public-adapter";

describe("public database adapter", () => {
  it("serves only public records and treats database content as inert Markdown", async () => {
    const source = await createInitialContentSnapshot();
    const hiddenPost = source.posts[0];
    hiddenPost.visibility = "private";
    hiddenPost.content = "hidden body";
    const publicPost = source.posts[1];
    publicPost.frontmatter = {
      ...publicPost.frontmatter,
      internalSecret: "private metadata",
    };
    const hiddenProject = source.projects[0];
    hiddenProject.status = "draft";
    const read = jest.fn(async () => source);
    const adapter = createPublicContentAdapter(read);
    expect(await adapter.post(hiddenPost.slug)).toBeNull();
    expect(await adapter.project(hiddenProject.slug)).toBeUndefined();
    const post = await adapter.post(publicPost.slug);
    expect(post?.format).toBe("markdown");
    expect(post?.content).toBe(publicPost.content);
    expect(JSON.stringify(post)).not.toContain("private metadata");
    expect(
      (await adapter.posts()).some((item) => item.slug === hiddenPost.slug),
    ).toBe(false);
    expect((await adapter.activities()).some((item) => item.sample)).toBe(
      false,
    );
    expect(
      (await adapter.tracks()).every((item) => item.visibility === "public"),
    ).toBe(true);
    expect(
      (await adapter.achievements()).find((item) => item.id === "first-article")
        ?.earnedAt,
    ).toBeDefined();
  });
  it("rejects unsafe identifiers before reading storage", async () => {
    const read = jest.fn(async () => createInitialContentSnapshot());
    const adapter = createPublicContentAdapter(read);
    expect(await adapter.post("../../private")).toBeNull();
    expect(await adapter.project("../../private")).toBeUndefined();
    expect(read).not.toHaveBeenCalled();
  });
});

it("preserves public post metadata and project details across the migration projection", async () => {
  const snapshot = await createInitialContentSnapshot();
  const adapter = createPublicContentAdapter(async () => snapshot);
  for (const source of snapshot.posts.filter(
    (post) =>
      post.status === "published" &&
      post.visibility === "public" &&
      !post.sample &&
      Date.parse(post.publishedAt) <= Date.now(),
  )) {
    const post = await adapter.post(source.slug);
    expect(post?.content).toBe(source.content);
    expect(post?.frontmatter.title).toBe(source.title);
    expect(post?.frontmatter.description).toBe(source.description);
    for (const field of [
      "author",
      "category",
      "readTime",
      "image",
      "tags",
    ] as const) {
      if (source.frontmatter[field] !== undefined)
        expect(post?.frontmatter[field]).toEqual(source.frontmatter[field]);
    }
  }
  for (const source of snapshot.projects) {
    expect(await adapter.project(source.slug)).toEqual(source.project);
  }
});
