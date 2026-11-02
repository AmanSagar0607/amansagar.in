import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  if (!["github", "x"].includes(platform)) return new NextResponse("Not found", { status: 404 });
  const settings = await getPublicSiteSettings();
  const link = (settings.socialLinks ?? defaultSiteSettings.socialLinks ?? []).find((item) => item.label.toLowerCase() === platform);
  if (!link) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(link.href, { status: 307, headers: { "Cache-Control": "no-store" } });
}
