import { describe, it, expect } from "@jest/globals";
import fs from "node:fs";
import {
  isPublicActivity,
  trackProgress,
  reconcileAwards,
  badgeDates,
  isChallengeComplete,
} from "../logic";
import { validateJourney } from "../validation";
import { isPublishedPost } from "../../mdx-utils";
import type { Activity, JourneyData } from "../types";
function seed(): JourneyData {
  return JSON.parse(
    fs.readFileSync("src/content/journey/journey.json", "utf8"),
  );
}
function activity(index = 1): Activity {
  return {
    ...seed().activities[0],
    slug: `note-${index}`,
    sample: false,
    status: "published",
    visibility: "public",
    date: `2026-01-${String(index).padStart(2, "0")}`,
    content: "Actual observations and a working example.",
  };
}
describe("publication boundaries", () => {
  it("keeps six sample drafts private and uncompleted", () => {
    const d = seed();
    expect(d.activities).toHaveLength(6);
    expect(d.activities.filter(isPublicActivity)).toHaveLength(0);
    expect(trackProgress(d.tracks[0])).toBe(0);
    expect(d.awards).toEqual([]);
    expect(validateJourney(d, [], [])).toEqual(d);
  });
  it.each([
    { status: "draft" },
    { visibility: "private" },
    { sample: true },
    { date: "2999-01-01" },
  ])("hides unpublished activity %p", (changes) => {
    expect(isPublicActivity({ ...activity(), ...changes } as Activity)).toBe(
      false,
    );
  });
  it("preserves legacy blog posts and hides drafts/private/sample/future posts", () => {
    expect(isPublishedPost({ date: "2025-01-01" })).toBe(true);
    for (const flags of [
      { status: "draft" },
      { published: false },
      { visibility: "private" },
      { sample: true },
      { date: "2999-01-01" },
    ])
      expect(isPublishedPost(flags)).toBe(false);
  });
});
describe("earned achievements", () => {
  it("ignores arbitrary tags", () => {
    const d = seed();
    d.activities = [activity()];
    d.activities[0].tags = ["builder", "open-source"];
    expect(badgeDates(d, "open-source")).toEqual([]);
    expect(badgeDates(d, "building")).toEqual([]);
    expect(reconcileAwards(d).awards).toEqual([]);
  });
  it("stores threshold dates without duplicate awards", () => {
    const d = seed();
    d.activities = [1, 2, 3, 4, 5].map(activity);
    const awarded = reconcileAwards(d);
    expect(awarded.awards).toEqual([
      { badgeId: "curious-mind", earnedAt: "2026-01-05" },
    ]);
    expect(reconcileAwards(awarded).awards).toEqual(awarded.awards);
  });
  it("counts distinct days and completed builds", () => {
    const d = seed();
    d.activities = [
      activity(),
      { ...activity(2), date: "2026-01-01" },
      { ...activity(3), type: "building", completion: "in-progress" },
    ];
    expect(badgeDates(d, "active-days")).toHaveLength(2);
    expect(badgeDates(d, "building")).toHaveLength(0);
    d.activities[2].completion = "completed";
    expect(badgeDates(d, "building")).toHaveLength(1);
  });
});
describe("validation and evidence", () => {
  it("requires existing relationships and safe URLs", () => {
    const d = seed();
    d.activities[0].projectSlugs = ["invented"];
    expect(() => validateJourney(d, [], [])).toThrow("Unknown project");
    d.activities[0].projectSlugs = [];
    d.activities[0].demoUrl = "javascript:alert(1)";
    expect(() => validateJourney(d, [], [])).toThrow("http(s)");
  });
  it("requires articles in the existing blog and unique slugs", () => {
    const d = seed();
    d.activities[0].type = "article";
    expect(() => validateJourney(d, [], [])).toThrow("existing blog");
    d.activities[0].type = "learning";
    d.activities[1].slug = d.activities[0].slug;
    expect(() => validateJourney(d, [], [])).toThrow("Duplicate");
  });
  it("requires published evidence for milestone progress", () => {
    const d = seed();
    d.tracks[0].milestones[0].completedAt = "2026-01-01";
    expect(() => validateJourney(d, [], [])).toThrow(
      "published public activity",
    );
    d.activities = [activity()];
    d.tracks[0].milestones[0].activitySlug = d.activities[0].slug;
    expect(validateJourney(d, [], [])).toEqual(d);
    expect(trackProgress(d.tracks[0])).toBe(13);
  });
  it("requires challenge evidence and a non-future date", () => {
    const d = seed();
    const c = d.challenges[0];
    c.completedAt = "2026-01-01";
    expect(isChallengeComplete(c, d.activities)).toBe(false);
    expect(() => validateJourney(d, [], [])).toThrow("requires evidence");
    c.evidenceUrl = "https://example.com/notes";
    expect(isChallengeComplete(c, [])).toBe(true);
    expect(validateJourney(d, [], [])).toEqual(d);
    c.completedAt = "2999-01-01";
    expect(() => validateJourney(d, [], [])).toThrow("non-future");
  });
  it("requires verified contributions and existing shipped projects", () => {
    const d = seed();
    const a = activity();
    a.type = "milestone";
    a.completion = "completed";
    a.milestoneKind = "open-source";
    d.activities = [a];
    expect(() => validateJourney(d, [], [])).toThrow("verified contribution");
    a.verifiedEvidenceUrl = "https://github.com/example/tool/pull/1";
    expect(badgeDates(d, "open-source")).toHaveLength(1);
    a.milestoneKind = "project-shipped";
    expect(() => validateJourney(d, [], [])).toThrow("existing project");
  });
});
