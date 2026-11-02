import { NextRequest, NextResponse } from "next/server";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";
import { AdminForbiddenError, AdminUnauthorizedError } from "@/lib/admin/content-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest) {
  try {
    const service = await supabaseContentServiceFor(request);
    const snapshot = await service.readAdmin();
    const slug = request.nextUrl.searchParams.get("slug");
    const project = snapshot.projects.find((item) => item.slug === slug);
    if (!project?.project.githubUrl) return NextResponse.json({ error: "No GitHub repository is configured for this project." }, { status: 404, headers });
    const match = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i.exec(project.project.githubUrl);
    if (!match) return NextResponse.json({ error: "Enter a GitHub repository URL in the project editor." }, { status: 400, headers });
    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(match[1])}/${encodeURIComponent(match[2])}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "aman-sagar-studio" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.json({ error: response.status === 404 ? "Repository not found or not public." : "GitHub is temporarily unavailable or rate-limited." }, { status: 502, headers });
    const data = await response.json();
    return NextResponse.json({ name: data.full_name, defaultBranch: data.default_branch, openIssues: data.open_issues_count, stars: data.stargazers_count, lastPush: data.pushed_at, archived: data.archived }, { headers });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError || error instanceof AdminForbiddenError) return NextResponse.json({ error: "Not authorized." }, { status: error instanceof AdminUnauthorizedError ? 401 : 403, headers });
    return NextResponse.json({ error: "Unable to check GitHub right now." }, { status: 503, headers });
  }
}
