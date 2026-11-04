import type { InitialContentSnapshot } from "./content-types";
import type { ContentKind } from "./revalidation";
import type { MediaAsset, MediaPage } from "./media-service";

export class AdminClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminClientError";
  }
}
async function parse(response: Response): Promise<Record<string, unknown>> {
  let input: unknown;
  try {
    input = await response.json();
  } catch {
    throw new AdminClientError(
      "The server returned an invalid response.",
      response.status,
    );
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new AdminClientError(
      "The server returned an invalid response.",
      response.status,
    );
  const value = input as Record<string, unknown>;
  if (!response.ok)
    throw new AdminClientError(
      typeof value.error === "string" ? value.error : "The request failed.",
      response.status,
    );
  return value;
}
async function call(
  url: string,
  init: RequestInit = {},
): Promise<Record<string, unknown>> {
  return parse(
    await fetch(url, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    }),
  );
}
export async function loadContent(): Promise<InitialContentSnapshot> {
  const data = await call("/api/admin/content");
  const snapshot = data.snapshot;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
    throw new AdminClientError("The server returned invalid content.", 502);
  return snapshot as InitialContentSnapshot;
}
export async function saveContent<T>(
  kind: ContentKind,
  record: T,
  previousId?: string,
): Promise<{ record: T; revalidated: boolean }> {
  const data = await call("/api/admin/content", {
    method: previousId === undefined ? "POST" : "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      record,
      ...(previousId === undefined ? {} : { previousId }),
    }),
  });
  if (
    !data.result ||
    typeof data.result !== "object" ||
    Array.isArray(data.result)
  )
    throw new AdminClientError("The server returned invalid content.", 502);
  return { record: data.result as T, revalidated: data.revalidated === true };
}
export async function deleteContent(
  kind: ContentKind,
  id: string,
): Promise<{ revalidated: boolean }> {
  const data = await call("/api/admin/content", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
  });
  return { revalidated: data.revalidated === true };
}
export async function listMedia(cursor?: string): Promise<MediaPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const data = await call(`/api/admin/media${query}`);
  if (!Array.isArray(data.assets))
    throw new AdminClientError("The server returned invalid media.", 502);
  return {
    assets: data.assets as MediaAsset[],
    nextCursor:
      typeof data.nextCursor === "string" ? data.nextCursor : undefined,
  };
}
export async function uploadMedia(file: File): Promise<MediaAsset> {
  const body = new FormData();
  body.set("file", file);
  const data = await call("/api/admin/media", { method: "POST", body });
  if (
    !data.asset ||
    typeof data.asset !== "object" ||
    Array.isArray(data.asset)
  )
    throw new AdminClientError("The server returned invalid media.", 502);
  return data.asset as MediaAsset;
}

export async function renameMedia(
  id: string,
  name: string,
): Promise<MediaAsset> {
  const data = await call("/api/admin/media", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
  if (!data.asset || typeof data.asset !== "object")
    throw new AdminClientError("The server returned invalid media.", 502);
  return data.asset as MediaAsset;
}

export async function deleteMedia(id: string): Promise<void> {
  await call("/api/admin/media", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export type AdminDocument = {
  id: string;
  originalFilename: string;
  byteSize: number;
  createdAt: string;
};
export async function listDocuments(): Promise<AdminDocument[]> {
  const data = await call("/api/admin/documents");
  if (!Array.isArray(data.documents))
    throw new AdminClientError("The server returned invalid documents.", 502);
  return data.documents as AdminDocument[];
}
export async function uploadDocument(file: File): Promise<AdminDocument> {
  const body = new FormData();
  body.set("file", file);
  const data = await call("/api/admin/documents", { method: "POST", body });
  if (!data.document || typeof data.document !== "object")
    throw new AdminClientError(
      "The server returned invalid document metadata.",
      502,
    );
  return data.document as AdminDocument;
}
export async function renameDocument(id: string, name: string): Promise<void> {
  await call("/api/admin/documents", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name }),
  });
}
export async function deleteDocument(id: string): Promise<void> {
  await call("/api/admin/documents", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}
export async function previewDocument(id: string): Promise<string> {
  const data = await call(
    `/api/admin/documents/${encodeURIComponent(id)}/preview`,
  );
  if (typeof data.url !== "string" || !data.url.startsWith("https://"))
    throw new AdminClientError(
      "The server returned an invalid preview link.",
      502,
    );
  return data.url;
}

/** These endpoints must be mounted with a real identity provider before use. */
export async function signIn(email: string, password: string): Promise<void> {
  const data = await call("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (data.success !== true)
    throw new AdminClientError("The server returned an invalid response.", 502);
}

export async function signOut(): Promise<void> {
  const data = await call("/api/admin/logout", { method: "POST" });
  if (data.success !== true)
    throw new AdminClientError("The server returned an invalid response.", 502);
}
