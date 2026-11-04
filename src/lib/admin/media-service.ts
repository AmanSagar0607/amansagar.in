import "server-only";
import type { RequireAdmin } from "./content-service";

export type MediaAsset = {
  id: string;
  publicId: string;
  displayName?: string;
  url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  createdAt: string;
};
export type MediaPage = { assets: MediaAsset[]; nextCursor?: string };
export interface MediaProvider {
  list(cursor?: string): Promise<MediaPage>;
  upload(file: File): Promise<MediaAsset>;
  rename?(id: string, name: string): Promise<MediaAsset>;
  delete?(id: string): Promise<void>;
}
export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}
const folder = "Aman-Portfolio";
const maxBytes = 4 * 1024 * 1024;
const accepted = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export class MediaProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaProviderError";
  }
}
function credentials(): CloudinaryCredentials {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret)
    throw new MediaProviderError("Media storage is not configured.");
  return { cloudName, apiKey, apiSecret };
}
function text(input: unknown): string {
  return typeof input === "string" ? input : "";
}
function asset(input: unknown, cloudName: string): MediaAsset {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new MediaProviderError("Invalid media response.");
  const data = input as Record<string, unknown>;
  const id = text(data.asset_id);
  const publicId = text(data.public_id);
  const url = text(data.secure_url);
  const format = text(data.format);
  const createdAt = text(data.created_at);
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !parsed.pathname.startsWith(`/${cloudName}/image/upload/`)
    )
      throw new Error();
  } catch {
    throw new MediaProviderError("Invalid media URL.");
  }
  if (
    !id ||
    !publicId.startsWith(`${folder}/`) ||
    !format ||
    !Number.isFinite(Date.parse(createdAt)) ||
    typeof data.bytes !== "number" ||
    !Number.isFinite(data.bytes) ||
    data.bytes < 0
  )
    throw new MediaProviderError("Invalid media response.");
  return {
    id,
    publicId,
    displayName:
      text(data.display_name) || publicId.split("/").at(-1) || publicId,
    url,
    format,
    bytes: data.bytes,
    width: typeof data.width === "number" ? data.width : undefined,
    height: typeof data.height === "number" ? data.height : undefined,
    createdAt,
  };
}
async function verifiedImage(file: File): Promise<void> {
  if (!accepted.has(file.type) || file.size < 12 || file.size > maxBytes)
    throw new MediaProviderError(
      "Choose a JPEG, PNG, WebP, GIF or AVIF image up to 4 MB.",
    );
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  const valid =
    (file.type === "image/jpeg" &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff) ||
    (file.type === "image/png" &&
      [137, 80, 78, 71, 13, 10, 26, 10].every(
        (value, index) => bytes[index] === value,
      )) ||
    (file.type === "image/gif" && ["GIF87a", "GIF89a"].includes(ascii(0, 6))) ||
    (file.type === "image/webp" &&
      ascii(0, 4) === "RIFF" &&
      ascii(8, 12) === "WEBP") ||
    (file.type === "image/avif" &&
      ascii(4, 8) === "ftyp" &&
      (ascii(8, 12) === "avif" || ascii(8, 12) === "avis"));
  if (!valid)
    throw new MediaProviderError(
      "The image data does not match its file type.",
    );
}
/** Server-only adapter; callers must enforce the same admin authorization as content operations. */
export class CloudinaryMediaProvider implements MediaProvider {
  constructor(
    private readonly requireAdmin: RequireAdmin,
    private readonly getCredentials: () => CloudinaryCredentials = credentials,
    private readonly request: typeof fetch = fetch,
  ) {}
  async list(cursor?: string): Promise<MediaPage> {
    await this.requireAdmin();
    if (cursor && (cursor.length > 2048 || /[\u0000-\u001f]/.test(cursor)))
      throw new MediaProviderError("Invalid media cursor.");
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret)
      throw new MediaProviderError("Media storage is not configured.");
    const url = new URL(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
    );
    url.searchParams.set("prefix", `${folder}/`);
    url.searchParams.set("max_results", "50");
    if (cursor) url.searchParams.set("next_cursor", cursor);
    const response = await this.request(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      },
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok)
      throw new MediaProviderError("Could not load media from storage.");
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new MediaProviderError("Invalid media response.");
    const data = body as Record<string, unknown>;
    if (!Array.isArray(data.resources))
      throw new MediaProviderError("Invalid media response.");
    return {
      assets: data.resources.map((item) => asset(item, cloudName)),
      nextCursor:
        typeof data.next_cursor === "string" ? data.next_cursor : undefined,
    };
  }
  async upload(file: File): Promise<MediaAsset> {
    await this.requireAdmin();
    await verifiedImage(file);
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret)
      throw new MediaProviderError("Media storage is not configured.");
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    form.set("unique_filename", "true");
    form.set("use_filename", "false");
    form.set("overwrite", "false");
    const response = await this.request(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        body: form,
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok)
      throw new MediaProviderError("Could not upload image to storage.");
    return asset(await response.json(), cloudName);
  }

  /** Change Cloudinary's display name while preserving the stable public ID and URL. */
  async rename(id: string, name: string): Promise<MediaAsset> {
    await this.requireAdmin();
    if (
      !/^[0-9a-f-]{20,64}$/i.test(id) ||
      !name.trim() ||
      name.length > 120 ||
      /[\u0000-\u001f\u007f]/.test(name)
    )
      throw new MediaProviderError("Invalid media name.");
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const form = new URLSearchParams({ display_name: name.trim() });
    const response = await this.request(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok) throw new MediaProviderError("Could not rename media.");
    const refreshed = await this.request(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!refreshed.ok)
      throw new MediaProviderError("Image name could not be verified.");
    const updated = asset(await refreshed.json(), cloudName);
    if (updated.displayName !== name.trim())
      throw new MediaProviderError(
        "This Cloudinary folder does not support display-name edits.",
      );
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.requireAdmin();
    if (!/^[0-9a-f-]{20,64}$/i.test(id))
      throw new MediaProviderError("Invalid media item.");
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const response = await this.request(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: new URLSearchParams({ "asset_ids[]": id }),
        cache: "no-store",
        redirect: "error",
      },
    );
    if (!response.ok) throw new MediaProviderError("Could not delete media.");
    const body: unknown = await response.json();
    const deleted =
      body && typeof body === "object"
        ? (body as Record<string, unknown>).deleted
        : null;
    if (
      !deleted ||
      typeof deleted !== "object" ||
      (deleted as Record<string, unknown>)[id] !== "deleted"
    )
      throw new MediaProviderError("Media was not deleted.");
  }
}
