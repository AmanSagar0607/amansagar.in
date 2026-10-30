import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { AdminForbiddenError, AdminUnauthorizedError } from "./content-http";
import { MediaProviderError, type MediaProvider } from "./media-service";

const maxBody = 4 * 1024 * 1024 + 128 * 1024;
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}
export interface MediaRouteDependencies {
  /** Verify a server-side admin session before reading request data or creating a provider. */
  authorize: (request: NextRequest) => Promise<void>;
  providerFor: (request: NextRequest) => Promise<MediaProvider>;
}
function respond(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers });
}
function errorResponse(error: unknown) {
  if (error instanceof RequestError)
    return respond({ error: error.message }, error.status);
  if (error instanceof AdminUnauthorizedError)
    return respond({ error: error.message }, 401);
  if (error instanceof AdminForbiddenError)
    return respond({ error: error.message }, 403);
  if (error instanceof MediaProviderError)
    return respond(
      { error: error.message },
      error.message.includes("not configured") ? 503 : 400,
    );
  return respond({ error: "Media storage is unavailable." }, 502);
}
function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError(403, "Same-origin request required.");
}
async function fileFromRequest(request: NextRequest): Promise<File> {
  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data\s*;/i.test(contentType))
    throw new RequestError(415, "Expected a multipart image upload.");
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBody)
    throw new RequestError(413, "Image upload exceeds the allowed size.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "Missing upload body.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > maxBody) {
      await reader.cancel();
      throw new RequestError(413, "Image upload exceeds the allowed size.");
    }
    chunks.push(part.value);
  }
  let data: FormData;
  try {
    const bytes = Buffer.concat(chunks);
    data = await new Request(request.url, {
      method: "POST",
      headers: { "content-type": contentType },
      body: bytes,
    }).formData();
  } catch {
    throw new RequestError(400, "Invalid upload body.");
  }
  const file = data.get("file");
  if (
    !file ||
    typeof file === "string" ||
    data.getAll("file").length !== 1 ||
    [...data.keys()].some((key) => key !== "file")
  )
    throw new RequestError(400, "Select exactly one image.");
  return file;
}
export function createMediaRouteHandlers(dependencies: MediaRouteDependencies) {
  async function GET(request: NextRequest) {
    try {
      await dependencies.authorize(request);
      const provider = await dependencies.providerFor(request);
      const cursor = request.nextUrl.searchParams.get("cursor") || undefined;
      return respond(await provider.list(cursor));
    } catch (error) {
      return errorResponse(error);
    }
  }
  async function POST(request: NextRequest) {
    try {
      checkOrigin(request);
      await dependencies.authorize(request);
      const file = await fileFromRequest(request);
      const provider = await dependencies.providerFor(request);
      return respond({ asset: await provider.upload(file) }, 201);
    } catch (error) {
      return errorResponse(error);
    }
  }
  return { GET, POST };
}
