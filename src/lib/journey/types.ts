export const activityTypes = [
  "learning",
  "research",
  "building",
  "article",
  "milestone",
] as const;
export type ActivityType = (typeof activityTypes)[number];
export type Visibility = "public" | "private";
export interface Resource {
  title: string;
  url: string;
}
export interface Activity {
  slug: string;
  title: string;
  description: string;
  content: string;
  type: ActivityType;
  date: string;
  updatedAt: string;
  status: "draft" | "published";
  visibility: Visibility;
  sample: boolean;
  completion: "planned" | "in-progress" | "completed";
  trackSlugs: string[];
  projectSlugs: string[];
  technologies: string[];
  tags: string[];
  references: Resource[];
  attachments: Resource[];
  githubUrl?: string;
  demoUrl?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  blogSlug?: string;
  milestoneKind?: "project-shipped" | "open-source";
  verifiedEvidenceUrl?: string;
}
export interface Track {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  startDate?: string;
  status: "planned" | "active" | "paused" | "on-break" | "completed";
  visibility: Visibility;
  milestones: {
    id: string;
    title: string;
    completedAt?: string;
    activitySlug?: string;
  }[];
  projectSlugs: string[];
}
export interface Challenge {
  id: string;
  title: string;
  category: string;
  description: string;
  date?: string;
  visibility: Visibility;
  activitySlug?: string;
  evidenceUrl?: string;
  completedAt?: string;
}
export type BadgeMetric =
  | "learning"
  | "research"
  | "building"
  | "article"
  | "active-days"
  | "open-source"
  | "project-shipped"
  | "track";
export interface BadgeRule {
  id: string;
  title: string;
  description: string;
  requirement: string;
  metric: BadgeMetric;
  target: number;
}
export interface Award {
  badgeId: string;
  earnedAt: string;
}
export interface AchievementView {
  id: string;
  title: string;
  description: string;
  requirement: string;
  current: number;
  target: number;
  earnedAt?: string;
}
export interface JourneyData {
  activities: Activity[];
  tracks: Track[];
  challenges: Challenge[];
  awards: Award[];
  badgeRules: BadgeRule[];
}
