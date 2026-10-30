import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  AdminClientError,
  deleteContent,
  listMedia,
  loadContent,
  saveContent,
  uploadMedia,
} from "../client";
const original = global.fetch;
afterEach(() => {
  global.fetch = original;
});
describe("admin request client", () => {
  it("sends create, update and delete requests with same-origin credentials", async () => {
    const calls = jest.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({ result: { slug: "post" }, revalidated: true }),
          { status: 200 },
        ),
    );
    global.fetch = calls;
    const result = await saveContent("post", { slug: "post" });
    await saveContent("post", { slug: "post" }, "post");
    await deleteContent("post", "post");
    expect(result).toEqual({ record: { slug: "post" }, revalidated: true });
    expect(calls.mock.calls.map((call) => call[1]?.method)).toEqual([
      "POST",
      "PUT",
      "DELETE",
    ]);
    expect(
      calls.mock.calls.every(
        (call) =>
          call[1]?.credentials === "same-origin" &&
          call[1]?.cache === "no-store",
      ),
    ).toBe(true);
  });
  it("propagates explicit server errors and rejects invalid JSON", async () => {
    global.fetch = jest.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ error: "Authentication required." }), {
          status: 401,
        }),
    );
    await expect(loadContent()).rejects.toMatchObject({
      name: "AdminClientError",
      message: "Authentication required.",
      status: 401,
    });
    global.fetch = jest.fn<typeof fetch>(
      async () => new Response("<!doctype html>", { status: 503 }),
    );
    await expect(loadContent()).rejects.toBeInstanceOf(AdminClientError);
  });
  it("preserves media cursor and sends uploads as multipart FormData", async () => {
    const calls = jest.fn<typeof fetch>(
      async (_url, init) =>
        new Response(
          JSON.stringify(
            init?.method === "POST"
              ? { asset: { id: "asset" } }
              : { assets: [], nextCursor: "next" },
          ),
          { status: 200 },
        ),
    );
    global.fetch = calls;
    expect((await listMedia("page+1")).nextCursor).toBe("next");
    expect(String(calls.mock.calls[0][0])).toContain("cursor=page%2B1");
    await uploadMedia(new File(["image"], "image.png", { type: "image/png" }));
    const init = calls.mock.calls[1][1];
    expect(init?.body).toBeInstanceOf(FormData);
    expect(init?.headers).toBeUndefined();
  });
});

it("sends credentials to the login endpoint and calls logout with same-origin credentials", async () => {
  const calls = jest.fn<typeof fetch>(
    async () => new Response(JSON.stringify({ success: true })),
  );
  global.fetch = calls;
  const { signIn, signOut } = await import("../client");
  await signIn("admin@example.com", "secret");
  await signOut();
  expect(calls.mock.calls[0][0]).toBe("/api/admin/login");
  expect(JSON.parse(String(calls.mock.calls[0][1]?.body))).toEqual({
    email: "admin@example.com",
    password: "secret",
  });
  expect(calls.mock.calls[1][0]).toBe("/api/admin/logout");
  expect(
    calls.mock.calls.every(
      (call) =>
        call[1]?.method === "POST" &&
        call[1]?.credentials === "same-origin" &&
        call[1]?.cache === "no-store",
    ),
  ).toBe(true);
});

it("does not accept an unsuccessful authentication response as a session", async () => {
  global.fetch = jest.fn<typeof fetch>(
    async () => new Response(JSON.stringify({ success: false })),
  );
  const { signIn } = await import("../client");
  await expect(signIn("admin@example.com", "secret")).rejects.toBeInstanceOf(
    AdminClientError,
  );
});
