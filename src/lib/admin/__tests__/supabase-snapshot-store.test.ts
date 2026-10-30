import { createClient } from "@supabase/supabase-js";
jest.mock("server-only", () => ({}), { virtual: true });
import { SupabaseSnapshotStore } from "../supabase-snapshot-store";
import type { InitialContentSnapshot } from "../content-types";

const snapshot = {
  posts: [],
  projects: [],
  journey: {
    activities: [],
    tracks: [],
    challenges: [],
    badgeRules: [],
    awards: [],
  },
} satisfies InitialContentSnapshot;
function createStore(fetcher: typeof fetch) {
  return new SupabaseSnapshotStore(
    createClient("https://example.supabase.co", "test-secret", {
      global: { fetch: fetcher },
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  );
}
it("reads the stored revision and content", async () => {
  const store = createStore(
    async () =>
      new Response(JSON.stringify({ revision: "rev-1", content: snapshot }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
  );
  expect(await store.load()).toEqual({ revision: "rev-1", content: snapshot });
});
it("uses an atomic revision filter and reports a conflict when no row matches", async () => {
  let requestUrl = "";
  const store = createStore(async (input) => {
    requestUrl = String(input);
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  expect(await store.compareAndSwap("old-revision", snapshot)).toBe(false);
  expect(new URL(requestUrl).searchParams.get("revision")).toBe(
    "eq.old-revision",
  );
  expect(new URL(requestUrl).searchParams.get("singleton")).toBe("eq.true");
});
it("treats a duplicate singleton as already initialized", async () => {
  const store = createStore(
    async () =>
      new Response(JSON.stringify({ code: "23505", message: "duplicate" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
  );
  expect(await store.insertIfAbsent(snapshot)).toBe(false);
});
