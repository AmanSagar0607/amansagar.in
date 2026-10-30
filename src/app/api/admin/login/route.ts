import { NextRequest, NextResponse } from "next/server";
import { configuredAuthHandlers } from "@/lib/admin/supabase-auth-routes";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    return await configuredAuthHandlers().login(request);
  } catch {
    return NextResponse.json(
      { error: "Authentication is unavailable." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
