import { afterEach, describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { dashboardMetrics } from "../dashboard";
afterEach(() => {
  jest.useRealTimers();
});
describe("dashboard activity metrics", () => {
  it("counts published records by month once, excluding drafts, private and future records", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-10-30T12:00:00Z"));
    const data = await createInitialContentSnapshot();
    const post = {
      ...data.posts[0],
      publishedAt: "2026-10-01",
      status: "published" as const,
      visibility: "public" as const,
    };
    const old = data.journey.activities[0];
    data.posts = [
      post,
      { ...post, slug: "private-post", visibility: "private" },
      { ...post, slug: "future-post", publishedAt: "2026-11-01" },
    ];
    data.journey.activities = [
      {
        ...old,
        slug: "linked",
        type: "article",
        blogSlug: post.slug,
        date: "2026-10-01",
        status: "published",
        visibility: "public",
        sample: false,
      },
      {
        ...old,
        slug: "learning",
        date: "2026-10-03",
        status: "published",
        visibility: "public",
        sample: false,
      },
      {
        ...old,
        slug: "draft",
        date: "2026-10-05",
        status: "draft",
        visibility: "private",
        sample: false,
      },
    ];
    const metrics = dashboardMetrics(data);
    expect(metrics.monthlyActivity).toHaveLength(6);
    expect(metrics.monthlyActivity.at(-1)).toEqual({
      month: "2026-10",
      label: "Oct 2026",
      count: 2,
    });
    expect(metrics.publishedPosts).toBe(1);
  });
});
