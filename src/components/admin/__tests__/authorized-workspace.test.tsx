import { describe, expect, it, jest } from "@jest/globals";
jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/components/journey/activity-markdown", () => ({
  ActivityMarkdown: () => null,
}));
import { createInitialContentSnapshot } from "@/lib/admin/initial-snapshot";
import {
  ContentService,
  type ContentTransactionRepository,
} from "@/lib/admin/content-service";
import {
  AuthorizedContentEdit,
  AuthorizedDashboard,
  AuthorizedMedia,
  AuthorizedSettings,
} from "../authorized-workspace";
import type { InitialContentSnapshot } from "@/lib/admin/content-types";
function repo(
  snapshot: InitialContentSnapshot,
): ContentTransactionRepository & { calls: number } {
  return {
    calls: 0,
    async read() {
      this.calls++;
      return snapshot;
    },
    async transact<T>(): Promise<T> {
      throw new Error("unexpected write");
    },
  };
}
describe("authorized admin server views", () => {
  it("never renders private content when admin verification fails", async () => {
    const data = repo(await createInitialContentSnapshot());
    const service = new ContentService(data, async () => {
      throw new Error("Unauthorized");
    });
    await expect(AuthorizedDashboard({ service })).rejects.toThrow(
      "Unauthorized",
    );
    await expect(
      AuthorizedContentEdit({
        service,
        section: "posts",
        id: "new",
        creating: true,
      }),
    ).rejects.toThrow("Unauthorized");
    expect(data.calls).toBe(0);
  });
  it("supplies real settings and dashboard data only after verification", async () => {
    const source = await createInitialContentSnapshot();
    const data = repo(source);
    const verify = jest.fn(async () => {});
    const service = new ContentService(data, verify);
    const dashboard = await AuthorizedDashboard({ service });
    expect(dashboard.props.metrics.publishedPosts).toBeGreaterThan(0);
    const settings = await AuthorizedSettings({ service });
    expect(settings.props.initial).toEqual(source.settings);
    expect(verify).toHaveBeenCalledTimes(2);
  });
  it("authorizes before the media provider can load its initial page", async () => {
    const data = repo(await createInitialContentSnapshot());
    const service = new ContentService(data, async () => {
      throw new Error("Unauthorized");
    });
    const provider = {
      list: jest.fn(async () => {
        throw new Error("Unauthorized");
      }),
      upload: jest.fn(async () => {
        throw new Error("Unexpected");
      }),
    };
    await expect(AuthorizedMedia({ service, provider })).rejects.toThrow(
      "Unauthorized",
    );
    expect(provider.list).not.toHaveBeenCalled();
  });
});
