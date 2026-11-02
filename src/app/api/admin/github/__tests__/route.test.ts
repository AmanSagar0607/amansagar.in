import { NextRequest } from "next/server";
import { GET } from "../route";
import { AdminUnauthorizedError } from "@/lib/admin/content-http";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/admin/supabase-content-service", () => ({ supabaseContentServiceFor: jest.fn() }));
const service = jest.mocked(supabaseContentServiceFor);
const request = () => new NextRequest("https://example.com/api/admin/github?slug=project");
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; jest.clearAllMocks(); });

test("requires an authorized admin before calling GitHub", async () => {
  service.mockResolvedValue({ readAdmin: async () => { throw new AdminUnauthorizedError(); } } as unknown as Awaited<ReturnType<typeof supabaseContentServiceFor>>);
  global.fetch = jest.fn();
  expect((await GET(request())).status).toBe(401);
  expect(global.fetch).not.toHaveBeenCalled();
});

test("rejects non-GitHub URLs before making an external request", async () => {
  service.mockResolvedValue({ readAdmin: async () => ({ projects: [{ slug: "project", project: { githubUrl: "https://github.com.evil.example/repo" } }] }) } as unknown as Awaited<ReturnType<typeof supabaseContentServiceFor>>);
  global.fetch = jest.fn();
  expect((await GET(request())).status).toBe(400);
  expect(global.fetch).not.toHaveBeenCalled();
});

test("returns repository metadata from GitHub for an authorized admin", async () => {
  service.mockResolvedValue({ readAdmin: async () => ({ projects: [{ slug: "project", project: { githubUrl: "https://github.com/example/repo" } }] }) } as unknown as Awaited<ReturnType<typeof supabaseContentServiceFor>>);
  global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ full_name: "example/repo", default_branch: "main", open_issues_count: 4, stargazers_count: 12, pushed_at: "2026-01-01T00:00:00Z", archived: false }), { status: 200 }));
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ name: "example/repo", defaultBranch: "main", openIssues: 4, stars: 12, lastPush: "2026-01-01T00:00:00Z", archived: false });
  expect(global.fetch).toHaveBeenCalledWith("https://api.github.com/repos/example/repo", expect.any(Object));
});
