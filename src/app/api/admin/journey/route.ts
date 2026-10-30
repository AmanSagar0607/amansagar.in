import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getJourney, saveJourney } from "@/lib/journey/store";
import { getAllProjects } from "@/lib/projects";
import { getMDXFiles } from "@/lib/mdx-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function authorize(request: NextRequest): NextResponse | null {
  const token = process.env.JOURNEY_ADMIN_TOKEN;
  if (process.env.NODE_ENV !== "development" || !token || token.length < 32) {
    return NextResponse.json(
      {
        error:
          "Local publishing is disabled. Start development with JOURNEY_ADMIN_TOKEN set to at least 32 characters.",
      },
      { status: 403, headers },
    );
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Cross-origin publishing is not allowed." },
      { status: 403, headers },
    );
  const authorization = request.headers.get("authorization") || "";
  const supplied = Buffer.from(
    authorization.startsWith("Bearer ") ? authorization.slice(7) : "",
  );
  const expected = Buffer.from(token);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return NextResponse.json(
      { error: "Invalid publishing token." },
      { status: 401, headers },
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = authorize(request);
  if (denied) return denied;
  try {
    const [journey, posts] = await Promise.all([
      getJourney(),
      getMDXFiles("src/content/posts"),
    ]);
    return NextResponse.json(
      {
        journey,
        projects: getAllProjects().map((p) => ({
          slug: p.slug,
          title: p.title,
        })),
        blogPosts: posts.map((p) => ({
          slug: p.slug,
          title: String(p.frontmatter.title),
        })),
      },
      { headers },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not read Journey content." },
      { status: 500, headers },
    );
  }
}

export async function PUT(request: NextRequest) {
  const denied = authorize(request);
  if (denied) return denied;
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json(
      { error: "Expected JSON content." },
      { status: 415, headers },
    );
  if (Number(request.headers.get("content-length")) > 1_048_576)
    return NextResponse.json(
      { error: "Content exceeds 1 MB." },
      { status: 413, headers },
    );
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing request body.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.byteLength;
      if (length > 1_048_576) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Content exceeds 1 MB." },
          { status: 413, headers },
        );
      }
      chunks.push(chunk.value);
    }
    await saveJourney(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    return NextResponse.json({ journey: await getJourney() }, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save content.",
      },
      { status: 400, headers },
    );
  }
}
