import "server-only";
import { cache } from "react";
import { getCmsPublicContent } from "@/lib/cms-public-content";
import type { ManagedApp, ManagedAppPage } from "@/lib/admin/content-types";

export const getPublicApps = cache(async (): Promise<ManagedApp[]> => {
  const cms = await getCmsPublicContent();
  return cms
    ? (await cms.apps()).sort((a, b) => Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder)
    : [];
});

export const getPublicApp = cache(async (slug: string): Promise<ManagedApp | undefined> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  const cms = await getCmsPublicContent();
  return cms?.app(slug);
});

export const getPublicAppPage = cache(async (appSlug: string, pageSlug: string | string[]): Promise<ManagedAppPage | undefined> => {
  const path = Array.isArray(pageSlug) ? pageSlug.join("/") : pageSlug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(appSlug) || !path.split("/").every((part) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part))) return undefined;
  const app = await getPublicApp(appSlug);
  return app?.pages.find((page) => page.slug === path);
});
