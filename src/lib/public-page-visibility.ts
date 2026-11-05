import "server-only";
import { getPublicSiteSettings } from "@/lib/public-site-settings";

/** Matches a hidden section route and all of its detail URLs. */
export function isPagePathVisible(path: string, hiddenPages: string[] = []) {
  const normalized = path.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  return !hiddenPages.some((hidden) =>
    hidden === "/"
      ? normalized === "/"
      : normalized === hidden || normalized.startsWith(`${hidden}/`),
  );
}

export async function isPublicPageVisible(path: string) {
  const settings = await getPublicSiteSettings();
  return isPagePathVisible(path, settings.hiddenPages);
}
