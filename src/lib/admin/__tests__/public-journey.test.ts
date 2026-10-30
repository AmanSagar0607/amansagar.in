import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { publicJourneyActivities } from "../public-journey";

describe("public journey projection", () => {
  it("contains existing published articles once and excludes sample drafts", async () => {
    const data = await createInitialContentSnapshot();
    const activities = publicJourneyActivities(data);
    expect(activities.filter((item) => item.type === "article")).toHaveLength(
      data.posts.filter(
        (post) =>
          post.status === "published" &&
          post.visibility === "public" &&
          Date.parse(post.publishedAt) <= Date.now(),
      ).length,
    );
    expect(activities.some((item) => item.sample)).toBe(false);
  });
  it("uses real blog content and removes links to private projects and tracks", async () => {
    const data = await createInitialContentSnapshot();
    const post = data.posts[0];
    const project = data.projects[0];
    project.visibility = "private";
    data.journey.tracks[0].visibility = "private";
    const entry = {
      ...data.journey.activities[0],
      slug: "linked-post",
      type: "article" as const,
      blogSlug: post.slug,
      status: "published" as const,
      visibility: "public" as const,
      sample: false,
      date: "2020-01-01",
      title: "Incorrect title",
      content: "Incorrect content",
      projectSlugs: [project.slug],
    };
    data.journey.activities = [entry];
    const activities = publicJourneyActivities(data);
    const article = activities.find((item) => item.slug === entry.slug);
    expect(article?.title).toBe(post.title);
    expect(article?.content).toBe(post.content);
    expect(article?.trackSlugs).toEqual([]);
    expect(article?.projectSlugs).toEqual([]);
    expect(
      activities.filter((item) => item.blogSlug === post.slug),
    ).toHaveLength(1);
    post.visibility = "private";
    expect(
      publicJourneyActivities(data).some((item) => item.blogSlug === post.slug),
    ).toBe(false);
  });
});
