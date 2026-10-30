import { describe, expect, it } from "@jest/globals";
import { affectedPublicPaths } from "../revalidation";
describe("CMS cache invalidation", () => {
  it("refreshes a post and every shared public surface", () => {
    const targets = affectedPublicPaths("post", "my-post");
    expect(targets).toEqual(
      expect.arrayContaining([
        { path: "/" },
        { path: "/blog" },
        { path: "/blog/my-post" },
        { path: "/journey/activity/[slug]", type: "page" },
        { path: "/projects/[slug]", type: "page" },
        { path: "/journey" },
        { path: "/achievements" },
        { path: "/sitemap.xml" },
      ]),
    );
  });
  it("refreshes related route patterns after activity and project changes", () => {
    expect(affectedPublicPaths("activity", "a-note")).toEqual(
      expect.arrayContaining([
        { path: "/journey/activity/a-note" },
        { path: "/projects/[slug]", type: "page" },
        { path: "/blog/[slug]", type: "page" },
      ]),
    );
    expect(affectedPublicPaths("project", "a-project")).toEqual(
      expect.arrayContaining([
        { path: "/projects/a-project" },
        { path: "/journey/[slug]", type: "page" },
      ]),
    );
  });
  it("rejects unsafe identifiers", () =>
    expect(() => affectedPublicPaths("post", "../private")).toThrow("Invalid"));
});
