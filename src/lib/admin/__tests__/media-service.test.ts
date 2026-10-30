import { describe, it, expect, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
import { CloudinaryMediaProvider } from "../media-service";
const credentials = () => ({
  cloudName: "test-cloud",
  apiKey: "test-key",
  apiSecret: "test-secret",
});
const raw = {
  asset_id: "asset-1",
  public_id: "Aman-Portfolio/asset-1",
  secure_url:
    "https://res.cloudinary.com/test-cloud/image/upload/v1/Aman-Portfolio/asset-1.png",
  format: "png",
  created_at: "2025-01-01T00:00:00Z",
  bytes: 64,
  width: 20,
  height: 10,
};
const png = () =>
  new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0, 0])],
    "test.png",
    { type: "image/png" },
  );
describe("protected portfolio media provider", () => {
  it("authorizes before reading credentials or contacting storage", async () => {
    const getCredentials = jest.fn(credentials);
    const request = jest.fn<typeof fetch>();
    const service = new CloudinaryMediaProvider(
      async () => {
        throw new Error("Unauthorized");
      },
      getCredentials,
      request,
    );
    await expect(service.list()).rejects.toThrow("Unauthorized");
    await expect(service.upload(png())).rejects.toThrow("Unauthorized");
    expect(getCredentials).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });
  it("lists only portfolio assets with server-side credentials and pagination", async () => {
    const request = jest.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({ resources: [raw], next_cursor: "next" }),
          { status: 200 },
        ),
    );
    const service = new CloudinaryMediaProvider(
      async () => {},
      credentials,
      request,
    );
    const page = await service.list("current");
    expect(page.assets[0]).toMatchObject({
      id: "asset-1",
      publicId: "Aman-Portfolio/asset-1",
      url: raw.secure_url,
    });
    expect(page.nextCursor).toBe("next");
    const [url, options] = request.mock.calls[0];
    expect(String(url)).toContain("prefix=Aman-Portfolio%2F");
    expect(String(url)).toContain("next_cursor=current");
    expect(options?.redirect).toBe("error");
    expect(JSON.stringify(page)).not.toContain("test-secret");
  });
  it("rejects forged file types and assets outside the portfolio folder", async () => {
    const request = jest.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            resources: [{ ...raw, public_id: "another-project/asset" }],
          }),
          { status: 200 },
        ),
    );
    const service = new CloudinaryMediaProvider(
      async () => {},
      credentials,
      request,
    );
    await expect(service.list()).rejects.toThrow("Invalid media response");
    const invalid = new File(["not-an-image-at-all"], "bad.png", {
      type: "image/png",
    });
    await expect(service.upload(invalid)).rejects.toThrow("does not match");
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("uploads validated images with the target folder and no secret in returned data", async () => {
    const request = jest.fn<typeof fetch>(
      async () => new Response(JSON.stringify(raw), { status: 200 }),
    );
    const service = new CloudinaryMediaProvider(
      async () => {},
      credentials,
      request,
    );
    const result = await service.upload(png());
    const options = request.mock.calls[0][1];
    const form = options?.body as FormData;
    expect(form.get("folder")).toBe("Aman-Portfolio");
    expect(form.get("overwrite")).toBe("false");
    expect(form.get("file")).toBeInstanceOf(File);
    expect(JSON.stringify(result)).not.toContain("test-secret");
  });
});
