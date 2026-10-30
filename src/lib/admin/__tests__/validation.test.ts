import { describe, it, expect } from "@jest/globals";
import {
  isPublicContent,
  validateManagedPost,
  validateManagedProject,
} from "../validation";
import type { ManagedPost, ManagedProject } from "../content-types";
const post: ManagedPost = {
  slug: "hello-world",
  title: "Hello",
  description: "Description",
  content: "Content",
  publishedAt: "2025-01-01",
  updatedAt: "2025-01-01",
  status: "published",
  visibility: "public",
  frontmatter: { tags: ["TypeScript"] },
};
const project: ManagedProject = {
  slug: "first-project",
  status: "draft",
  visibility: "private",
  updatedAt: "2025-01-01",
  project: {
    slug: "first-project",
    title: "Project",
    description: "Description",
    overview: "Overview",
    src: "/images/example.png",
    link: "https://example.com",
    date: "2025-01-01",
    technologies: [{ name: "TypeScript", category: "frontend" }],
  },
};
describe("server content validation", () => {
  it("accepts valid existing records and retains metadata", () => {
    expect(validateManagedPost(post)).toEqual(post);
    expect(validateManagedProject(project)).toEqual(project);
  });
  it("rejects unsafe slugs, protocols, malformed technology and oversized content", () => {
    expect(() =>
      validateManagedPost({ ...post, slug: "../../private" }),
    ).toThrow("Slug");
    expect(() =>
      validateManagedPost({ ...post, content: "x".repeat(100001) }),
    ).toThrow("Content");
    expect(() =>
      validateManagedPost({
        ...post,
        frontmatter: { image: "javascript:alert(1)" },
      }),
    ).toThrow("Cover image");
    expect(() =>
      validateManagedProject({
        ...project,
        project: { ...project.project, link: "javascript:alert(1)" },
      }),
    ).toThrow("link");
    expect(() =>
      validateManagedProject({
        ...project,
        project: {
          ...project.project,
          technologies: [{ name: "x", category: "invalid" }],
        },
      }),
    ).toThrow("category");
  });
  it("excludes drafts, private content, future posts and invalid dates", () => {
    expect(isPublicContent(post, Date.parse("2025-01-02"))).toBe(true);
    for (const change of [
      { status: "draft" },
      { visibility: "private" },
      { sample: true },
      { publishedAt: "2999-01-01" },
      { publishedAt: "invalid" },
    ])
      expect(
        isPublicContent({ ...post, ...change }, Date.parse("2025-01-02")),
      ).toBe(false);
  });
});
