import "server-only";
import { cache } from "react";
import { getCmsPublicContent } from "@/lib/cms-public-content";
import type { ManagedPage } from "@/lib/admin/content-types";

export const getPublicPages = cache(async (): Promise<ManagedPage[]> => {
  const cms = await getCmsPublicContent();
  return cms ? cms.pages() : [];
});

export const getPublicPage = cache(async (slug: string): Promise<ManagedPage | undefined> => {
  const cms = await getCmsPublicContent();
  return cms ? cms.page(slug) : undefined;
});
