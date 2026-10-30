import { describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import {
  ContentService,
  type ContentTransactionRepository,
} from "../content-service";
import {
  createContentRouteHandlers,
  AdminUnauthorizedError,
  AdminForbiddenError,
} from "../content-http";
import { createInitialContentSnapshot } from "../initial-snapshot";
import type { InitialContentSnapshot, ManagedPost } from "../content-types";
function repo(initial: InitialContentSnapshot): ContentTransactionRepository & {
  calls: number;
  current: () => InitialContentSnapshot;
} {
  let state = structuredClone(initial);
  return {
    calls: 0,
    current: () => structuredClone(state),
    async read() {
      this.calls++;
      return structuredClone(state);
    },
    async transact(operation) {
      this.calls++;
      const value = operation(structuredClone(state));
      state = structuredClone(value.snapshot);
      return value.result;
    },
  };
}
const draft: ManagedPost = {
  slug: "new-test-post",
  title: "Test post",
  description: "Description",
  content: "Body",
  publishedAt: "2025-01-01",
  updatedAt: "2025-01-01",
  status: "draft",
  visibility: "private",
  frontmatter: {},
};
function request(
  method: string,
  payload?: unknown,
  opts: { origin?: string; contentType?: string } = {},
) {
  return new NextRequest("https://portfolio.example/api/admin/content", {
    method,
    headers: {
      origin: opts.origin || "https://portfolio.example",
      "content-type": opts.contentType || "application/json",
    },
    ...(payload !== undefined
      ? {
          body: typeof payload === "string" ? payload : JSON.stringify(payload),
        }
      : {}),
  });
}
describe("authenticated CMS HTTP adapter", () => {
  it("rejects unauthorized and non-admin callers before touching storage", async () => {
    const data = repo(await createInitialContentSnapshot());
    const revalidate = jest.fn(
      async (targets: import("../revalidation").RevalidationTarget[]) => {
        void targets;
      },
    );
    const handlers = createContentRouteHandlers({
      serviceFor: async () =>
        new ContentService(data, async () => {
          throw new AdminUnauthorizedError();
        }),
      revalidate,
    });
    const get = await handlers.GET(request("GET"));
    expect(get.status).toBe(401);
    expect(get.headers.get("cache-control")).toContain("no-store");
    expect(
      (await handlers.POST(request("POST", { kind: "post", record: draft })))
        .status,
    ).toBe(401);
    expect(data.calls).toBe(0);
    expect(revalidate).not.toHaveBeenCalled();
    const forbidden = createContentRouteHandlers({
      serviceFor: async () =>
        new ContentService(data, async () => {
          throw new AdminForbiddenError();
        }),
      revalidate,
    });
    expect((await forbidden.GET(request("GET"))).status).toBe(403);
  });
  it("performs authenticated create, update and delete with revalidation", async () => {
    const data = repo(await createInitialContentSnapshot());
    const revalidate = jest.fn(
      async (targets: import("../revalidation").RevalidationTarget[]) => {
        void targets;
      },
    );
    const handlers = createContentRouteHandlers({
      serviceFor: async () => new ContentService(data, async () => {}),
      revalidate,
    });
    expect(
      (await handlers.POST(request("POST", { kind: "post", record: draft })))
        .status,
    ).toBe(201);
    const updated = { ...draft, title: "Updated" };
    expect(
      (
        await handlers.PUT(
          request("PUT", {
            kind: "post",
            previousId: draft.slug,
            record: updated,
          }),
        )
      ).status,
    ).toBe(200);
    expect(
      data.current().posts.find((post) => post.slug === draft.slug)?.title,
    ).toBe("Updated");
    expect(revalidate).toHaveBeenCalledTimes(2);
    expect(revalidate.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        { path: "/blog/new-test-post" },
        { path: "/sitemap.xml" },
      ]),
    );
    expect(
      (
        await handlers.DELETE(
          request("DELETE", { kind: "post", id: draft.slug }),
        )
      ).status,
    ).toBe(200);
    expect(data.current().posts.some((post) => post.slug === draft.slug)).toBe(
      false,
    );
  });
  it("rejects cross-origin, unsupported media type, oversized and invalid data", async () => {
    const data = repo(await createInitialContentSnapshot());
    const handlers = createContentRouteHandlers({
      serviceFor: async () => new ContentService(data, async () => {}),
      revalidate: async () => {},
    });
    expect(
      (
        await handlers.POST(
          request(
            "POST",
            { kind: "post", record: draft },
            { origin: "https://evil.example" },
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await handlers.POST(
          request("POST", "{}", { contentType: "text/plain" }),
        )
      ).status,
    ).toBe(415);
    expect(
      (await handlers.POST(request("POST", "x".repeat(1_048_577)))).status,
    ).toBe(413);
    expect((await handlers.POST(request("POST", "{"))).status).toBe(400);
    expect(
      (
        await handlers.POST(
          request("POST", { kind: "post", record: { ...draft, title: "" } }),
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await handlers.DELETE(
          request("DELETE", { kind: "post", id: "../../private" }),
        )
      ).status,
    ).toBe(400);
    expect(data.current().posts.some((post) => post.slug === draft.slug)).toBe(
      false,
    );
  });
  it("returns a conflict for duplicates and reports revalidation failure without repeating a committed write", async () => {
    const data = repo(await createInitialContentSnapshot());
    const handlers = createContentRouteHandlers({
      serviceFor: async () => new ContentService(data, async () => {}),
      revalidate: async () => {
        throw new Error("cache unavailable");
      },
    });
    const first = await handlers.POST(
      request("POST", { kind: "post", record: draft }),
    );
    expect(first.status).toBe(201);
    expect((await first.json()).revalidated).toBe(false);
    expect(
      (await handlers.POST(request("POST", { kind: "post", record: draft })))
        .status,
    ).toBe(409);
    expect(
      data.current().posts.filter((post) => post.slug === draft.slug),
    ).toHaveLength(1);
  });
  it("does not expose repository failures in responses", async () => {
    const data = repo(await createInitialContentSnapshot());
    data.read = async () => {
      throw new Error("database secret connection string");
    };
    const handlers = createContentRouteHandlers({
      serviceFor: async () => new ContentService(data, async () => {}),
      revalidate: async () => {},
    });
    const response = await handlers.GET(request("GET"));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
