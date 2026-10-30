import { NextRequest, NextResponse } from "next/server";
import { createInitialContentSnapshot } from "@/lib/admin/initial-snapshot";
import { createSupabaseContentRepository } from "@/lib/admin/supabase-repository";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";

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
    return NextResponse.json(
      { initialized: inserted },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to initialize CMS content." },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
