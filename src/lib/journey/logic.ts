import type {
  Activity,
  BadgeMetric,
  Challenge,
  JourneyData,
  Track,
} from "./types";

export function isPublicActivity(a: Activity): boolean {
  return (
    a.status === "published" &&
    a.visibility === "public" &&
    !a.sample &&
    Date.parse(a.date) <= Date.now()
  );
}
export function trackProgress(track: Track): number {
  return track.milestones.length
    ? Math.round(
        (track.milestones.filter((m) => m.completedAt).length /
          track.milestones.length) *
          100,
      )
    : 0;
}
export function activityHref(a: Activity): string {
  return a.blogSlug ? `/blog/${a.blogSlug}` : `/journey/activity/${a.slug}`;
}
export function isChallengeComplete(
  c: Challenge,
  activities: Activity[],
): boolean {
  return Boolean(
    c.completedAt &&
      (c.evidenceUrl ||
        activities.some(
          (a) => a.slug === c.activitySlug && isPublicActivity(a),
        )),
  );
}
export function badgeDates(data: JourneyData, metric: BadgeMetric): string[] {
  const activities = data.activities.filter(isPublicActivity);
  let dates: string[];
  switch (metric) {
    case "active-days":
      dates = [
        ...new Set(
          activities.map((a) => new Date(a.date).toISOString().slice(0, 10)),
        ),
      ];
      break;
    case "track":
      dates = data.tracks
        .filter(
          (t) =>
            t.visibility === "public" &&
            t.milestones.length &&
            trackProgress(t) === 100,
        )
        .map(
          (t) =>
            t.milestones
              .map((m) => m.completedAt!)
              .sort()
              .at(-1)!,
        );
      break;
    case "open-source":
      dates = activities
        .filter(
          (a) =>
            a.type === "milestone" &&
            a.milestoneKind === "open-source" &&
            a.completion === "completed" &&
            a.verifiedEvidenceUrl,
        )
        .map((a) => a.date);
      break;
    case "project-shipped":
      dates = activities
        .filter(
          (a) =>
            a.type === "milestone" &&
            a.milestoneKind === "project-shipped" &&
            a.completion === "completed" &&
            a.projectSlugs.length,
        )
        .map((a) => a.date);
      break;
    default:
      dates = activities
        .filter(
          (a) =>
            a.type === metric &&
            (metric !== "building" || a.completion === "completed"),
        )
        .map((a) => a.date);
  }
  return dates.sort((a, b) => Date.parse(a) - Date.parse(b));
}
export function reconcileAwards(data: JourneyData): JourneyData {
  const awards = new Map(data.awards.map((a) => [a.badgeId, a]));
  for (const rule of data.badgeRules) {
    const dates = badgeDates(data, rule.metric);
    if (dates.length >= rule.target && !awards.has(rule.id))
      awards.set(rule.id, {
        badgeId: rule.id,
        earnedAt: dates[rule.target - 1],
      });
  }
  return { ...data, awards: [...awards.values()] };
}
