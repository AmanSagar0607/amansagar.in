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
  visibility?: string;
  sample?: boolean;
  scheduled?: boolean;
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
  monthlyPublications?: {
    month: string;
    label: string;
    posts: number;
    activities: number;
  }[];
  draftQueue?: DashboardUpdate[];
  draftBreakdown?: { posts: number; projects: number; activities: number };
  scheduledPosts?: number;
  nextPublication?: { title: string; date: string; href: string };
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
  const monthRange = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1),
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
  const monthlyActivity = monthRange.slice(-6).map((month) => ({
    ...month,
    count: publicActivities.filter((activity) =>
      new Date(activity.date).toISOString().startsWith(month.month),
    ).length,
  }));
  const allUpdates: DashboardUpdate[] = [
    ...snapshot.posts.map((post) => ({
      id: `post:${post.slug}`,
      title: post.title,
      kind: "Blog post",
      date: post.updatedAt,
      href: `/admin/posts/edit/${post.slug}`,
      status: post.status,
      visibility: post.visibility,
      sample: post.sample,
      scheduled: Date.parse(post.publishedAt) > now.getTime(),
    })),
    ...snapshot.projects.map((item) => ({
      id: `project:${item.slug}`,
      title: item.project.title,
      kind: "Project",
      date: item.updatedAt,
      href: `/admin/projects/edit/${item.slug}`,
      status: item.status,
      visibility: item.visibility,
    })),
    ...snapshot.journey.activities.map((activity) => ({
      id: `activity:${activity.slug}`,
      title: activity.title,
      kind: "Journey",
      date: activity.updatedAt,
      href: `/admin/activities/edit/${activity.slug}`,
      status: activity.status,
      visibility: activity.visibility,
      sample: activity.sample,
      scheduled: Date.parse(activity.date) > now.getTime(),
    })),
  ]
    .filter((item) => Number.isFinite(Date.parse(item.date)))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const scheduledPosts = snapshot.posts
    .filter(
      (post) =>
        post.status === "published" &&
        post.visibility === "public" &&
        !post.sample &&
        Date.parse(post.publishedAt) > now.getTime(),
    )
    .sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  const nextPost = scheduledPosts[0];
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
    recentUpdates: allUpdates.slice(0, 8),
    monthlyActivity,
    monthlyPublications: monthRange.map((month) => ({
      month: month.month,
      label: month.label,
      activities: publicActivities.filter((activity) =>
        new Date(activity.date).toISOString().startsWith(month.month),
      ).length,
      posts: publishedPosts.filter((post) =>
        new Date(post.publishedAt).toISOString().startsWith(month.month),
      ).length,
    })),
    draftQueue: allUpdates
      .filter((item) => item.status === "draft")
      .slice(0, 4),
    draftBreakdown: {
      posts: snapshot.posts.filter((post) => post.status === "draft").length,
      projects: snapshot.projects.filter(
        (project) => project.status === "draft",
      ).length,
      activities: snapshot.journey.activities.filter(
        (activity) => activity.status === "draft",
      ).length,
    },
    scheduledPosts: scheduledPosts.length,
    nextPublication: nextPost
      ? {
          title: nextPost.title,
          date: nextPost.publishedAt,
          href: `/admin/posts/edit/${nextPost.slug}`,
        }
      : undefined,
  };
}
