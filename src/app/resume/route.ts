import { NextResponse } from "next/server";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import { createR2DocumentStore } from "@/lib/admin/r2-document-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPublicSiteSettings();
  const id = settings.activeResumeId;
  if (id && settings.resumeVersions?.includes(id) && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    try {
      const store = createR2DocumentStore(async () => {});
      const signed = await store.getPreviewUrl(`private/documents/${id}.pdf`);
      const result = await fetch(signed, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
      if (!result.ok || !result.body) throw new Error("Resume unavailable");
      return new NextResponse(result.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=resume.pdf", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox", "Referrer-Policy": "no-referrer" } });
    } catch {
      let fallback = defaultSiteSettings.resumeUrl!;
      try { const candidate = new URL(settings.resumeUrl ?? fallback); if (candidate.protocol === "https:" && !candidate.username && !candidate.password) fallback = candidate.href; } catch { /* Use the configured default. */ }
      const safe = fallback.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return new NextResponse(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Résumé unavailable</title><body><main><h1>Résumé temporarily unavailable</h1><p>The current résumé could not be loaded. You can use the backup link instead.</p><p><a href="${safe}" rel="noopener noreferrer">Open backup résumé</a></p></main></body></html>`, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; base-uri 'none'; form-action 'none'", "X-Content-Type-Options": "nosniff" } });
    }
  }
  return NextResponse.redirect(
    settings.resumeUrl ?? defaultSiteSettings.resumeUrl!,
    { status: 307, headers: { "Cache-Control": "no-store" } },
  );
}
