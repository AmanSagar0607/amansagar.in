import { redirect } from "next/navigation";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPublicSiteSettings();
  redirect(settings.resumeUrl ?? defaultSiteSettings.resumeUrl!);
}
