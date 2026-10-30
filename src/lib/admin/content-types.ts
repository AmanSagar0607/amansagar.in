import type { SiteSettings } from "./site-settings";
import type { Project } from "@/types/project";
import type { JourneyData, Visibility } from "@/lib/journey/types";

export type ContentStatus = "draft" | "published";
/** Original frontmatter is retained so migrating a post does not discard metadata. */
export interface ManagedPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  status: ContentStatus;
  visibility: Visibility;
  sample?: boolean;
  frontmatter: Record<string, unknown>;
}
export interface ManagedProject {
  slug: string;
  status: ContentStatus;
  visibility: Visibility;
  updatedAt: string;
  project: Project;
}
export interface InitialContentSnapshot {
  posts: ManagedPost[];
  projects: ManagedProject[];
  journey: JourneyData;
  settings?: SiteSettings;
}
