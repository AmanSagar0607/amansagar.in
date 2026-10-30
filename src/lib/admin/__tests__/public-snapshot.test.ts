import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { projectPublicSnapshot } from "../public-snapshot";

describe("public content projection", () => {
  it("does not expose draft bodies, private metadata or hidden relationship IDs", async () => {
    const data = await createInitialContentSnapshot();
    const privateProject = data.projects[0];
    privateProject.visibility = "private";
    const privateTrack = {
      ...data.journey.tracks[0],
      slug: "private-track",
      visibility: "private" as const,
    };
    data.journey.tracks.push(privateTrack);
    const draft = data.journey.activities[0];
    draft.trackSlugs = [privateTrack.slug];
    draft.projectSlugs = [privateProject.slug];
    draft.content = "secret draft body";
    data.journey.challenges.push({
      id: "linked",
      title: "A challenge",
      category: "Learning",
      description: "",
      visibility: "public",
      activitySlug: draft.slug,
    });
    Object.assign(data.posts[1], {
      internalSecret: "private-top-level-secret",
    });
    Object.assign(data.projects[1].project, {
      internalSecret: "private-project-secret",
    });
    Object.assign(data.journey.tracks[0], {
      internalSecret: "private-track-secret",
    });
    const post = data.posts[0];
    post.frontmatter = {
      ...post.frontmatter,
      internalToken: "secret metadata",
      tags: ["AI"],
      projectSlugs: [privateProject.slug, data.projects[1].slug],
      trackSlugs: [privateTrack.slug, data.journey.tracks[0].slug],
    };
    const output = projectPublicSnapshot(data);
    expect(JSON.stringify(output)).not.toContain("secret draft body");
    expect(JSON.stringify(output)).not.toContain("secret metadata");
    expect(JSON.stringify(output)).not.toContain("private-top-level-secret");
    expect(JSON.stringify(output)).not.toContain("private-project-secret");
    expect(JSON.stringify(output)).not.toContain("private-track-secret");
    expect(
      output.projects.some((project) => project.slug === privateProject.slug),
    ).toBe(false);
    expect(
      output.journey.tracks.some((track) => track.slug === privateTrack.slug),
    ).toBe(false);
    expect(
      output.journey.challenges.find((item) => item.id === "linked")
        ?.activitySlug,
    ).toBeUndefined();
    expect(
      output.posts.find((item) => item.slug === post.slug)?.frontmatter.tags,
    ).toEqual(["AI"]);
    const projectedPost = output.posts.find((item) => item.slug === post.slug);
    expect(projectedPost?.frontmatter.projectSlugs).toEqual([
      data.projects[1].slug,
    ]);
    expect(projectedPost?.frontmatter.trackSlugs).toEqual([
      data.journey.tracks[0].slug,
    ]);
    const projectedArticle = output.journey.activities.find(
      (item) => item.blogSlug === post.slug,
    );
    expect(projectedArticle?.projectSlugs).toEqual([data.projects[1].slug]);
    expect(projectedArticle?.trackSlugs).toEqual([data.journey.tracks[0].slug]);
  });
  it("excludes future and private posts from all public surfaces", async () => {
    const data = await createInitialContentSnapshot();
    data.posts[0].visibility = "private";
    data.posts[1].publishedAt = "2999-01-01";
    const result = projectPublicSnapshot(data);
    expect(
      result.posts.some((post) =>
        [data.posts[0].slug, data.posts[1].slug].includes(post.slug),
      ),
    ).toBe(false);
    expect(
      result.journey.activities.some((activity) =>
        [data.posts[0].slug, data.posts[1].slug].includes(
          activity.blogSlug || "",
        ),
      ),
    ).toBe(false);
  });
});

it("reveals scheduled posts and activities only after their publication time", async () => {
  const data = await createInitialContentSnapshot();
  const post = data.posts[0];
  post.status = "published";
  post.visibility = "public";
  post.sample = false;
  post.publishedAt = "2030-01-02T00:00:00Z";
  const before = projectPublicSnapshot(
    data,
    Date.parse("2030-01-01T23:59:59Z"),
  );
  const after = projectPublicSnapshot(data, Date.parse("2030-01-02T00:00:00Z"));
  expect(before.posts.some((item) => item.slug === post.slug)).toBe(false);
  expect(
    before.journey.activities.some((item) => item.blogSlug === post.slug),
  ).toBe(false);
  expect(after.posts.some((item) => item.slug === post.slug)).toBe(true);
  expect(
    after.journey.activities.some((item) => item.blogSlug === post.slug),
  ).toBe(true);
});
