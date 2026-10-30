import type { InitialContentSnapshot } from "../content-types";
import { describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import { createInitialContentSnapshot } from "../initial-snapshot";
import {
  ContentService,
  type ContentTransactionRepository,
} from "../content-service";
import {
  createContentRouteHandlers,
  AdminUnauthorizedError,
} from "../content-http";
import { defaultSiteSettings } from "../site-settings";
import { projectPublicSnapshot } from "../public-snapshot";
function repo(
  initial: InitialContentSnapshot,
): ContentTransactionRepository & { value: InitialContentSnapshot } {
  return {
    value: structuredClone(initial),
    async read() {
      return structuredClone(this.value);
    },
    async transact(operation) {
      const result = operation(structuredClone(this.value));
      this.value = result.snapshot;
      return result.result;
    },
  };
}
function request(method: string, record: unknown) {
  return new NextRequest("https://portfolio.example/api/admin/content", {
    method,
    headers: {
      origin: "https://portfolio.example",
      "content-type": "application/json",
    },
    body: JSON.stringify({ kind: "settings", previousId: "site", record }),
  });
}
describe("public site settings", () => {
  it("migrates actual existing settings and exposes only allowed fields", async () => {
    const source = await createInitialContentSnapshot();
    expect(source.settings).toEqual(defaultSiteSettings);
    Object.assign(source.settings!, { internalSecret: "secret" });
    expect(
      JSON.stringify(projectPublicSnapshot(source).settings),
    ).not.toContain("secret");
  });
  it("requires admin access, validates updates and invalidates public layout", async () => {
    const store = repo(await createInitialContentSnapshot());
    const revalidate = jest.fn(
      async (paths: import("../revalidation").RevalidationTarget[]) => {
        void paths;
      },
    );
    const denied = createContentRouteHandlers({
      serviceFor: async () =>
        new ContentService(store, async () => {
          throw new AdminUnauthorizedError();
        }),
      revalidate,
    });
    expect((await denied.PUT(request("PUT", defaultSiteSettings))).status).toBe(
      401,
    );
    const routes = createContentRouteHandlers({
      serviceFor: async () => new ContentService(store, async () => {}),
      revalidate,
    });
    const settings = {
      siteTitle: "Updated title",
      siteDescription: "Updated description",
      contactEmail: "owner@example.com",
    };
    expect((await routes.PUT(request("PUT", settings))).status).toBe(200);
    expect(projectPublicSnapshot(store.value).settings).toEqual(settings);
    expect(revalidate.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        { path: "/", type: "layout" },
        { path: "/contact" },
      ]),
    );
    expect(
      (
        await routes.PUT(
          request("PUT", { ...settings, contactEmail: "not-an-email" }),
        )
      ).status,
    ).toBe(400);
    expect(projectPublicSnapshot(store.value).settings).toEqual(settings);
    expect((await routes.DELETE(request("DELETE", settings))).status).toBe(405);
  });
});
