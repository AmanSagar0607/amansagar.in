import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createInitialContentSnapshot } from "@/lib/admin/initial-snapshot";
import { createSupabaseContentRepository } from "@/lib/admin/supabase-repository";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";
import { AdminForbiddenError, AdminUnauthorizedError } from "@/lib/admin/content-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Imports the existing file-based portfolio only once. The repository refuses
 * to overwrite CMS data, and service authorization is verified per request.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return NextResponse.json(
      { error: "Same-origin request required." },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  try {
    const service = await supabaseContentServiceFor(request);
    await service.authorize();
    const inserted = await createSupabaseContentRepository().initialize(
      await createInitialContentSnapshot(),
      () => service.authorize(),
    );
    let revalidated = true;
    if (inserted) {
      try {
        revalidatePath("/", "layout");
        revalidatePath("/blog/[slug]", "page");
        revalidatePath("/projects/[slug]", "page");
        revalidatePath("/journey/[slug]", "page");
        revalidatePath("/journey/activity/[slug]", "page");
        revalidatePath("/sitemap.xml");
      } catch {
        revalidated = false;
      }
    }
    return NextResponse.json(
      { initialized: inserted, revalidated },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof AdminUnauthorizedError || error instanceof AdminForbiddenError) {
      return NextResponse.json(
        { error: "Not authorized." },
        { status: error instanceof AdminUnauthorizedError ? 401 : 403, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return NextResponse.json(
      { error: "Unable to initialize CMS content." },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
