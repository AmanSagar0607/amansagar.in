import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { AdminForbiddenError, AdminUnauthorizedError } from "./content-http";
import type { DocumentService } from "./document-service";
import { MAX_PDF_BYTES } from "./document-validation";

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
  }
}
function respond(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers });
}
function sameOrigin(request: NextRequest) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError(403, "Same-origin request required.");
}
function error(error: unknown) {
  if (error instanceof RequestError)
    return respond({ error: error.message }, error.status);
  if (error instanceof AdminUnauthorizedError)
    return respond({ error: error.message }, 401);
  if (error instanceof AdminForbiddenError)
    return respond({ error: error.message }, 403);
  if (
    error instanceof Error &&
    /Invalid|Choose a PDF|file contents|not found/i.test(error.message)
  )
    return respond({ error: error.message }, 400);
  return respond({ error: "Private document storage is unavailable." }, 502);
}
async function json(request: NextRequest): Promise<Record<string, unknown>> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  )
    throw new RequestError(415, "Expected JSON content.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 4096) {
      await reader.cancel();
      throw new RequestError(413, "Request is too large.");
    }
    chunks.push(part.value);
  }
  let value: unknown;
  try {
    value = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
  } catch {
    throw new RequestError(400, "Invalid JSON content.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new RequestError(400, "Invalid request.");
  return value as Record<string, unknown>;
}
export function createDocumentRouteHandlers(
  serviceFor: (request: NextRequest) => Promise<DocumentService>,
) {
  async function GET(request: NextRequest) {
    try {
      const service = await serviceFor(request);
      return respond({ documents: await service.list() });
    } catch (cause) {
      return error(cause);
    }
  }
  async function POST(request: NextRequest) {
    try {
      sameOrigin(request);
      const service = await serviceFor(request);
      if (
        !/^multipart\/form-data\s*;/i.test(
          request.headers.get("content-type") || "",
        )
      )
        throw new RequestError(415, "Expected a PDF upload.");
      const length = Number(request.headers.get("content-length"));
      if (Number.isFinite(length) && length > MAX_PDF_BYTES + 128 * 1024)
        throw new RequestError(413, "PDF exceeds the 4 MB limit.");
      const reader = request.body?.getReader();
      if (!reader) throw new RequestError(400, "Missing upload body.");
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > MAX_PDF_BYTES + 128 * 1024) {
          await reader.cancel();
          throw new RequestError(413, "PDF exceeds the 4 MB limit.");
        }
        chunks.push(part.value);
      }
      let form: FormData;
      try {
        form = await new Request(request.url, {
          method: "POST",
          headers: {
            "content-type": request.headers.get("content-type") || "",
          },
          body: Buffer.concat(chunks),
        }).formData();
      } catch {
        throw new RequestError(400, "Invalid PDF upload.");
      }
      const file = form.get("file");
      if (
        !(file instanceof File) ||
        form.getAll("file").length !== 1 ||
        [...form.keys()].some((key) => key !== "file")
      )
        throw new RequestError(400, "Select one PDF file.");
      const { id } = await service.upload(file);
      const document = (await service.list()).find((item) => item.id === id);
      if (!document)
        throw new Error("Document upload metadata is unavailable.");
      return respond({ document }, 201);
    } catch (cause) {
      return error(cause);
    }
  }
  async function PATCH(request: NextRequest) {
    try {
      sameOrigin(request);
      const service = await serviceFor(request);
      const body = await json(request);
      if (typeof body.id !== "string" || typeof body.name !== "string")
        throw new RequestError(400, "Invalid document update.");
      await service.rename(body.id, body.name);
      return respond({ updated: true });
    } catch (cause) {
      return error(cause);
    }
  }
  async function DELETE(request: NextRequest) {
    try {
      sameOrigin(request);
      const service = await serviceFor(request);
      const body = await json(request);
      if (typeof body.id !== "string")
        throw new RequestError(400, "Invalid document id.");
      await service.delete(body.id);
      return respond({ deleted: true });
    } catch (cause) {
      return error(cause);
    }
  }
  return { GET, POST, PATCH, DELETE };
}
