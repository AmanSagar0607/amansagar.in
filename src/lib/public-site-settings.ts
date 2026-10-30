import "server-only";
import {
  defaultSiteSettings,
  type SiteSettings,
} from "@/lib/admin/site-settings";
import { getCmsPublicContent } from "@/lib/cms-public-content";
/** Existing repository settings remain authoritative until a CMS provider is connected. */
export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const cms = await getCmsPublicContent();
  if (cms) return cms.settings();
  return { ...defaultSiteSettings };
}
