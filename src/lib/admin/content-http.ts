import "server-only";
import { NextRequest, NextResponse } from "next/server";
import {
  ContentConflictError,
  ContentNotFoundError,
  ContentService,
  ContentValidationError,
  type JourneyCollection,
} from "./content-service";
import {
  affectedPublicPaths,
  type ContentKind,
  type RevalidationTarget,
} from "./revalidation";

const noStore = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
const maxBytes = 1_048_576;
const kinds = [
  "post",
  "project",
  "activity",
  "track",
  "challenge",
  "achievement",
  "settings",
] as const;
const collections: Record<
  Exclude<ContentKind, "post" | "project" | "settings">,
  JourneyCollection
> = {
  activity: "activities",
  track: "tracks",
  challenge: "challenges",
  achievement: "badgeRules",
};
export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Authentication required.");
    this.name = "AdminUnauthorizedError";
  }
}
export class AdminForbiddenError extends Error {
  constructor() {
    super("Admin access required.");
    this.name = "AdminForbiddenError";
  }
}
class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}
export type ContentRouteDependencies = {
  /** Creates a service bound to this request; its verifier must validate an admin session. */
  serviceFor: (request: NextRequest) => Promise<ContentService>;
  /** Called only after a successful durable commit. */
  revalidate: (targets: RevalidationTarget[]) => Promise<void>;
};
function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStore });
}
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError(403, "Same-origin request required.");
}
async function body(request: NextRequest): Promise<Record<string, unknown>> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  )
    throw new RequestError(415, "Expected JSON content.");
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > maxBytes)
    throw new RequestError(413, "Content exceeds 1 MB.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RequestError(413, "Content exceeds 1 MB.");
    }
    chunks.push(part.value);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
  } catch {
    throw new RequestError(400, "Invalid JSON content.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new RequestError(400, "Expected an object.");
  return parsed as Record<string, unknown>;
}
function kind(value: unknown): ContentKind {
  if (typeof value !== "string" || !kinds.includes(value as ContentKind))
    throw new RequestError(400, "Invalid content type.");
  return value as ContentKind;
}
function identifier(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  )
    throw new RequestError(400, "Invalid content identifier.");
  return value;
}
function handleError(error: unknown) {
  if (error instanceof RequestError)
    return response({ error: error.message }, error.status);
  if (error instanceof AdminUnauthorizedError)
    return response({ error: error.message }, 401);
  if (error instanceof AdminForbiddenError)
    return response({ error: error.message }, 403);
  if (error instanceof ContentConflictError)
    return response({ error: error.message }, 409);
  if (error instanceof ContentNotFoundError)
    return response({ error: error.message }, 404);
  if (error instanceof ContentValidationError)
    return response({ error: error.message }, 400);
  return response({ error: "Unable to process this request." }, 500);
}
function entityId(type: ContentKind, record: unknown): string {
  if (!record || typeof record !== "object" || Array.isArray(record))
    throw new RequestError(400, "Content must be an object.");
  const data = record as Record<string, unknown>;
  return identifier(
    type === "challenge" || type === "achievement" ? data.id : data.slug,
  );
}
async function save(
  service: ContentService,
  type: ContentKind,
  record: unknown,
  previous?: string,
) {
  if (type === "settings") return service.saveSettings(record);
  if (type === "post") return service.savePost(record, previous);
  if (type === "project") return service.saveProject(record, previous);
  return service.saveJourneyRecord(collections[type], record, previous);
}
async function remove(service: ContentService, type: ContentKind, id: string) {
  if (type === "settings")
    throw new RequestError(405, "Settings cannot be deleted.");
  if (type === "post") return service.deletePost(id);
  if (type === "project") return service.deleteProject(id);
  return service.deleteJourneyRecord(collections[type], id);
}
export function createContentRouteHandlers(
  dependencies: ContentRouteDependencies,
) {
  async function service(request: NextRequest) {
    const instance = await dependencies.serviceFor(request);
    await instance.authorize();
    return instance;
  }
  async function GET(request: NextRequest) {
    try {
      const instance = await service(request);
      const snapshot = await instance.readAdmin();
      return response({ snapshot });
    } catch (error) {
      return handleError(error);
    }
  }
  async function mutate(
    request: NextRequest,
    method: "POST" | "PUT" | "DELETE",
  ) {
    try {
      sameOrigin(request);
      const instance = await service(request);
      const input = await body(request);
      const type = kind(input.kind);
      if (type === "settings" && method !== "PUT")
        throw new RequestError(405, "Settings can only be updated.");
      const id =
        type === "settings"
          ? "site"
          : method === "DELETE"
            ? identifier(input.id)
            : entityId(type, input.record);
      const previous =
        method === "PUT" ? identifier(input.previousId) : undefined;
      if (type === "settings" && previous !== "site")
        throw new RequestError(400, "Invalid settings identifier.");
      const result =
        method === "DELETE"
          ? await remove(instance, type, id)
          : await save(instance, type, input.record, previous);
      let revalidated = true;
      try {
        await dependencies.revalidate(affectedPublicPaths(type, id));
      } catch {
        revalidated = false;
      }
      return response(
        { result: result ?? null, revalidated },
        method === "POST" ? 201 : 200,
      );
    } catch (error) {
      return handleError(error);
    }
  }
  return {
    GET,
    POST: (request: NextRequest) => mutate(request, "POST"),
    PUT: (request: NextRequest) => mutate(request, "PUT"),
    DELETE: (request: NextRequest) => mutate(request, "DELETE"),
  };
}
