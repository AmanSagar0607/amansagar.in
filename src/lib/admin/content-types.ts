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
  version?: number;
  history?: { version: number; updatedAt: string; summary: string }[];
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
  version?: number;
  history?: { version: number; updatedAt: string; summary: string }[];
  pinned?: boolean;
  /** Manual ordering position within pinned or unpinned projects. */
  sortOrder?: number;
  project: Project;
}
export interface ManagedPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  status: ContentStatus;
  visibility: Visibility;
  updatedAt: string;
  version?: number;
  history?: { version: number; updatedAt: string; summary: string }[];
  navigationTitle?: string;
  showInNavigation?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
}
export interface ManagedAppPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  status: ContentStatus;
  visibility: Visibility;
  updatedAt: string;
  version?: number;
  history?: { version: number; updatedAt: string; summary: string }[];
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
}
export interface ManagedApp {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  content: string;
  category: string;
  platform: "web" | "mobile" | "desktop" | "api" | "other";
  technologies: string[];
  icon?: string;
  coverImage?: string;
  screenshots: string[];
  launchUrl?: string;
  sourceUrl?: string;
  status: ContentStatus;
  visibility: Visibility;
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
  version?: number;
  history?: { version: number; updatedAt: string; summary: string }[];
  seoTitle?: string;
  seoDescription?: string;
  pages: ManagedAppPage[];
}
export interface InitialContentSnapshot {
  posts: ManagedPost[];
  projects: ManagedProject[];
  /** Optional for compatibility with snapshots created before custom pages existed. */
  pages?: ManagedPage[];
  /** Optional for backwards-compatible CMS snapshot upgrades. */
  apps?: ManagedApp[];
  journey: JourneyData;
  settings?: SiteSettings;
}
