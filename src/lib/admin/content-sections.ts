export const contentSections = {
  pages: { label: "Pages", singular: "page", kind: "page" },
  posts: { label: "Blog posts", singular: "post", kind: "post" },
  projects: { label: "Projects", singular: "project", kind: "project" },
  activities: {
    label: "Journey activities",
    singular: "activity",
    kind: "activity",
  },
  tracks: { label: "Learning tracks", singular: "track", kind: "track" },
  challenges: { label: "Challenges", singular: "challenge", kind: "challenge" },
  achievements: {
    label: "Achievements",
    singular: "achievement",
    kind: "achievement",
  },
} as const;
export type ContentSection = keyof typeof contentSections;
export function isContentSection(value: string): value is ContentSection {
  return Object.hasOwn(contentSections, value);
}
