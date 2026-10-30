import { describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import { AdminForbiddenError, AdminUnauthorizedError } from "../content-http";
import { createMediaRouteHandlers } from "../media-http";
import type { MediaAsset, MediaProvider } from "../media-service";
const example: MediaAsset = {
  id: "test",
  publicId: "Aman-Portfolio/test",
  url: "https://res.cloudinary.com/demo/image/upload/test.png",
  format: "png",
  bytes: 20,
  createdAt: "2025-01-01",
};
function get(url = "https://portfolio.example/api/admin/media") {
  return new NextRequest(url);
}
function post(
  body: BodyInit,
  options: { origin?: string; contentType?: string; length?: string } = {},
) {
  const headers = new Headers({
    origin: options.origin || "https://portfolio.example",
  });
  if (options.contentType) headers.set("content-type", options.contentType);
  if (options.length) headers.set("content-length", options.length);
  return new NextRequest("https://portfolio.example/api/admin/media", {
    method: "POST",
    headers,
    body,
  });
}
function provider() {
  const list = jest.fn<MediaProvider["list"]>(async () => ({
    assets: [example],
  }));
  const upload = jest.fn<MediaProvider["upload"]>(async () => example);
  return { list, upload };
}
describe("protected media HTTP adapter", () => {
  it("requires an admin session before creating a provider or reading upload data", async () => {
    const storage = provider();
    const providerFor = jest.fn(async () => storage);
    const handlers = createMediaRouteHandlers({
      authorize: async () => {
        throw new AdminUnauthorizedError();
      },
      providerFor,
    });
    expect((await handlers.GET(get())).status).toBe(401);
    const form = new FormData();
    form.set("file", new File(["test"], "x.png", { type: "image/png" }));
    expect((await handlers.POST(post(form))).status).toBe(401);
    expect(providerFor).not.toHaveBeenCalled();
    const forbidden = createMediaRouteHandlers({
      authorize: async () => {
        throw new AdminForbiddenError();
      },
      providerFor,
    });
    expect((await forbidden.GET(get())).status).toBe(403);
  });
  it("lists assets with cursor and no shared caching", async () => {
    const storage = provider();
    const handlers = createMediaRouteHandlers({
      authorize: async () => {},
      providerFor: async () => storage,
    });
    const response = await handlers.GET(
      get("https://portfolio.example/api/admin/media?cursor=next"),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(storage.list).toHaveBeenCalledWith("next");
    expect((await response.json()).assets).toHaveLength(1);
  });
  it("accepts one authenticated multipart image and rejects cross-origin requests", async () => {
    const storage = provider();
    const handlers = createMediaRouteHandlers({
      authorize: async () => {},
      providerFor: async () => storage,
    });
    const form = new FormData();
    form.set("file", new File(["test-image"], "x.png", { type: "image/png" }));
    const result = await handlers.POST(post(form));
    expect(result.status).toBe(201);
    expect(storage.upload).toHaveBeenCalledTimes(1);
    expect((await result.json()).asset.id).toBe("test");
    const other = new FormData();
    other.set("file", new File(["image"], "x.png", { type: "image/png" }));
    expect(
      (await handlers.POST(post(other, { origin: "https://evil.example" })))
        .status,
    ).toBe(403);
    expect(storage.upload).toHaveBeenCalledTimes(1);
  });
  it("rejects oversized, malformed and extra fields without calling storage", async () => {
    const storage = provider();
    const handlers = createMediaRouteHandlers({
      authorize: async () => {},
      providerFor: async () => storage,
    });
    expect(
      (await handlers.POST(post("x", { contentType: "text/plain" }))).status,
    ).toBe(415);
    expect(
      (
        await handlers.POST(
          post("x", {
            contentType: "multipart/form-data; boundary=x",
            length: "5000000",
          }),
        )
      ).status,
    ).toBe(413);
    const form = new FormData();
    form.set("file", new File(["test-image"], "x.png", { type: "image/png" }));
    form.set("folder", "other-project");
    expect((await handlers.POST(post(form))).status).toBe(400);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
