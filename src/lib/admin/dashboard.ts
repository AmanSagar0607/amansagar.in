import { isChallengeComplete, reconcileAwards } from "@/lib/journey/logic";
import { publicJourneyActivities } from "./public-journey";
import { isPublicContent } from "./validation";
import type { InitialContentSnapshot } from "./content-types";

export interface DashboardUpdate {
  id: string;
  title: string;
  kind: string;
  date: string;
  href: string;
  status: string;
}
export interface DashboardMetrics {
  publishedPosts: number;
  projects: number;
  activities: number;
  activeTracks: number;
  completedChallenges: number;
  earnedAchievements: number;
  drafts: number;
  recentUpdates: DashboardUpdate[];
  monthlyActivity: { month: string; label: string; count: number }[];
}

/** Derive counts and recent activity from source records, without demonstration data. */
export function dashboardMetrics(
  snapshot: InitialContentSnapshot,
): DashboardMetrics {
  const publishedPosts = snapshot.posts.filter((post) => isPublicContent(post));
  const publicActivities = publicJourneyActivities(snapshot);
  const journey = reconcileAwards({
    ...snapshot.journey,
    activities: publicActivities,
  });
  const now = new Date();
  const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1),
    );
    const id = month.toISOString().slice(0, 7);
    return {
      month: id,
      label: month.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
      count: publicActivities.filter((activity) =>
        new Date(activity.date).toISOString().startsWith(id),
      ).length,
    };
  });
  const recentUpdates: DashboardUpdate[] = [
    ...snapshot.posts.map((post) => ({
      id: `post:${post.slug}`,
      title: post.title,
      kind: "Blog post",
      date: post.updatedAt,
      href: `/admin/posts/edit/${post.slug}`,
      status: post.status,
    })),
    ...snapshot.projects.map((item) => ({
      id: `project:${item.slug}`,
      title: item.project.title,
      kind: "Project",
      date: item.updatedAt,
      href: `/admin/projects/edit/${item.slug}`,
      status: item.status,
    })),
    ...snapshot.journey.activities.map((activity) => ({
      id: `activity:${activity.slug}`,
      title: activity.title,
      kind: "Journey",
      date: activity.updatedAt,
      href: `/admin/activities/edit/${activity.slug}`,
      status: activity.status,
    })),
  ]
    .filter((item) => Number.isFinite(Date.parse(item.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 8);
  return {
    publishedPosts: publishedPosts.length,
    projects: snapshot.projects.length,
    activities: snapshot.journey.activities.length,
    activeTracks: snapshot.journey.tracks.filter(
      (track) => track.status === "active",
    ).length,
    completedChallenges: snapshot.journey.challenges.filter((challenge) =>
      isChallengeComplete(challenge, journey.activities),
    ).length,
    earnedAchievements: journey.awards.length,
    drafts:
      snapshot.posts.filter((post) => post.status === "draft").length +
      snapshot.projects.filter((project) => project.status === "draft").length +
      snapshot.journey.activities.filter(
        (activity) => activity.status === "draft",
      ).length,
    recentUpdates,
    monthlyActivity,
  };
}
