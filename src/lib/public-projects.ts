import "server-only";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { getCmsPublicContent } from "@/lib/cms-public-content";
import type { Project } from "@/types/project";

/** Public project access boundary. The local source remains authoritative until migration. */
export async function getPublicProjects(): Promise<Project[]> {
  const cms = await getCmsPublicContent();
  if (cms) return cms.projects();
  return getAllProjects().sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      Date.parse(b.date) - Date.parse(a.date),
  );
}
export async function getPublicProject(
  slug: string,
): Promise<Project | undefined> {
  const cms = await getCmsPublicContent();
  if (cms) return cms.project(slug);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  return getProjectBySlug(slug);
}
export async function getPublicProjectsBySlug(
  slugs: string[],
): Promise<Project[]> {
  const projects = await Promise.all(slugs.map(getPublicProject));
  return projects.filter(
    (project): project is Project => project !== undefined,
  );
}
