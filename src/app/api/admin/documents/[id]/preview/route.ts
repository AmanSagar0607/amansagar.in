import { NextRequest, NextResponse } from "next/server";
import { documentServiceFor } from "@/lib/admin/document-service-for";
import { AdminForbiddenError, AdminUnauthorizedError } from "@/lib/admin/content-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
  try {
    const service = await documentServiceFor(request);
    const url = await service.preview((await context.params).id);
    return url ? NextResponse.json({ url }, { headers }) : NextResponse.json({ error: "Document not found." }, { status: 404, headers });
  } catch (cause) {
    if (cause instanceof AdminUnauthorizedError) return NextResponse.json({ error: cause.message }, { status: 401, headers });
    if (cause instanceof AdminForbiddenError) return NextResponse.json({ error: cause.message }, { status: 403, headers });
    return NextResponse.json({ error: "Private document storage is unavailable." }, { status: 502, headers });
  }
}
