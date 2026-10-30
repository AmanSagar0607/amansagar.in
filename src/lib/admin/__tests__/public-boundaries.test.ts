import { describe, expect, it, jest } from "@jest/globals";
import matter from "gray-matter";
import fs from "node:fs";
jest.mock("server-only", () => ({}), { virtual: true });
import { getPublicPost, getPublicPosts } from "@/lib/public-posts";
import {
  getPublicProject,
  getPublicProjects,
  getPublicProjectsBySlug,
} from "@/lib/public-projects";

describe("public source boundaries", () => {
  it("keeps existing project slugs and related project order", async () => {
    const all = await getPublicProjects();
    expect(all.find((project) => project.slug === "sell-better")?.title).toBe(
      "Sell Better",
    );
    const related = await getPublicProjectsBySlug([
      "iphone-x",
      "sell-better",
      "missing",
    ]);
    expect(related.map((project) => project.slug)).toEqual([
      "iphone-x",
      "sell-better",
    ]);
    expect(await getPublicProject("../../secret")).toBeUndefined();
  });
  it("keeps public post metadata and Markdown body while blocking traversal", async () => {
    const slug = "why-ai-agents-need-persistent-memory";
    const source = matter(
      fs.readFileSync(`src/content/posts/${slug}.mdx`, "utf8"),
    );
    const list = await getPublicPosts();
    const post = await getPublicPost(slug);
    expect(list.some((item) => item.slug === slug)).toBe(true);
    expect(post?.frontmatter.title).toEqual(source.data.title);
    expect(post?.content).toEqual(source.content);
    expect(post?.format).toBe("trusted-mdx");
    expect(await getPublicPost("../../secret")).toBeNull();
  });
});
