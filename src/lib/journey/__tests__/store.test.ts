import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import fs from "node:fs";
import io from "node:fs/promises";
import type { JourneyData } from "../types";
jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
  readdir: jest.fn(async () => ["real-article.mdx"]),
  writeFile: jest.fn(async () => undefined),
  rename: jest.fn(async () => undefined),
}));
jest.mock("@/lib/projects", () => ({ getAllProjects: () => [] }));
jest.mock("@/lib/mdx-utils", () => ({
  getMDXFiles: async () => [
    {
      slug: "real-article",
      content: "---\ntitle: Real article\n---\nActual existing blog content.",
      frontmatter: {
        title: "Real article",
        description: "Actual article",
        date: "2025-01-01",
      },
    },
  ],
}));
import { getPublicActivities, saveJourney } from "../store";
const seed = (): JourneyData =>
  JSON.parse(fs.readFileSync("src/content/journey/journey.json", "utf8"));
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(io.readFile).mockResolvedValue(JSON.stringify(seed()));
});
describe("file-based content integration", () => {
  it("projects the existing blog into Journey and hides all sample drafts", async () => {
    const activities = await getPublicActivities();
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({
      title: "Real article",
      blogSlug: "real-article",
      content: "Actual existing blog content.",
    });
  });
  it("persists calculated awards atomically and ignores client-granted badges", async () => {
    const data = seed();
    data.awards = [{ badgeId: "curious-mind", earnedAt: "2020-01-01" }];
    await saveJourney(data);
    const calls = jest.mocked(io.writeFile).mock.calls;
    expect(calls).toHaveLength(1);
    const saved = JSON.parse(String(calls[0][1])) as JourneyData;
    expect(saved.awards).toEqual([
      { badgeId: "first-article", earnedAt: "2025-01-01" },
    ]);
    expect(io.rename).toHaveBeenCalledTimes(1);
  });
  it("preserves original article content while merging relationship records", async () => {
    const data = seed();
    data.activities = [
      {
        ...data.activities[0],
        slug: "linked-real-article",
        type: "article",
        blogSlug: "real-article",
        sample: false,
        status: "published",
        visibility: "public",
        date: "2026-01-01",
        content: "Should never replace the real blog content.",
      },
    ];
    jest.mocked(io.readFile).mockResolvedValue(JSON.stringify(data));
    const items = await getPublicActivities();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      content: "Actual existing blog content.",
      date: "2025-01-01",
      slug: "linked-real-article",
    });
  });
});
