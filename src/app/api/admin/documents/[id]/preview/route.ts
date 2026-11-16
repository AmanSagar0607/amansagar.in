import { NextRequest, NextResponse } from "next/server";
import { documentServiceFor } from "@/lib/admin/document-service-for";
import { documentErrorResponse } from "@/lib/admin/document-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };
  try {
    const service = await documentServiceFor(request);
    const url = await service.preview((await context.params).id);
    if (!url) return NextResponse.json({ error: "Document not found." }, { status: 404, headers });
    const upstream = await fetch(url, { cache: "no-store", redirect: "error" });
    if (!upstream.ok || !upstream.body) throw new Error("Unable to retrieve document.");
    return new NextResponse(upstream.body, {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (cause) {
    return documentErrorResponse(cause);
  }
}
