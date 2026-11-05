import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPublicSiteSettings();
  return NextResponse.redirect(
    settings.resumeUrl ?? defaultSiteSettings.resumeUrl!,
    { status: 307, headers: { "Cache-Control": "no-store" } },
  );
}
