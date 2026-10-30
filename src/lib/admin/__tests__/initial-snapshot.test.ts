import { describe, expect, it, jest } from "@jest/globals";
import fs from "node:fs";
import matter from "gray-matter";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import { dashboardMetrics } from "../dashboard";

describe("portfolio migration snapshot", () => {
  it("preserves the original post slug, body and frontmatter", async () => {
    const snapshot = await createInitialContentSnapshot();
    const source = matter(
      fs.readFileSync(
        "src/content/posts/why-ai-agents-need-persistent-memory.mdx",
        "utf8",
      ),
    );
    const post = snapshot.posts.find(
      (item) => item.slug === "why-ai-agents-need-persistent-memory",
    );
    expect(post).toBeDefined();
    expect(post?.content).toBe(source.content);
    expect(post?.frontmatter).toEqual(source.data);
    expect(post?.status).toBe("published");
  });
  it("preserves project links and does not publish the example journey drafts", async () => {
    const snapshot = await createInitialContentSnapshot();
    expect(
      snapshot.projects.find((item) => item.slug === "sell-better")?.project
        .link,
    ).toBe("https://sell-better.vercel.app");
    expect(snapshot.journey.activities).toHaveLength(6);
    expect(
      snapshot.journey.activities.every(
        (item) =>
          item.sample &&
          item.status === "draft" &&
          item.visibility === "private",
      ),
    ).toBe(true);
    const metrics = dashboardMetrics(snapshot);
    expect(metrics.drafts).toBeGreaterThanOrEqual(6);
    expect(metrics.activeTracks).toBe(1);
    expect(metrics.completedChallenges).toBe(0);
    expect(metrics.publishedPosts).toBe(
      snapshot.posts.filter(
        (post) =>
          post.status === "published" &&
          post.visibility === "public" &&
          Date.parse(post.publishedAt) <= Date.now(),
      ).length,
    );
  });
});
