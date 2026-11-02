import { NextRequest } from "next/server";
import { POST } from "../route";
import { AdminUnauthorizedError } from "@/lib/admin/content-http";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";
import { createSupabaseContentRepository } from "@/lib/admin/supabase-repository";
import { revalidatePath } from "next/cache";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/admin/initial-snapshot", () => ({ createInitialContentSnapshot: jest.fn(async () => ({ posts: [] })) }));
jest.mock("@/lib/admin/supabase-repository", () => ({ createSupabaseContentRepository: jest.fn() }));
jest.mock("@/lib/admin/supabase-content-service", () => ({ supabaseContentServiceFor: jest.fn() }));

const request = (origin = "https://example.com") => new NextRequest("https://example.com/api/admin/initialize", { method: "POST", headers: { origin } });
const service = jest.mocked(supabaseContentServiceFor);
const repository = jest.mocked(createSupabaseContentRepository);
const authorize = jest.fn();
const initialize = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  authorize.mockResolvedValue(undefined);
  service.mockResolvedValue({ authorize } as unknown as Awaited<ReturnType<typeof supabaseContentServiceFor>>);
  repository.mockReturnValue({ initialize } as unknown as ReturnType<typeof createSupabaseContentRepository>);
});

test("rejects cross-origin requests and unauthenticated users before import", async () => {
  expect((await POST(request("https://other.example"))).status).toBe(403);
  expect(service).not.toHaveBeenCalled();
  authorize.mockRejectedValueOnce(new AdminUnauthorizedError());
  expect((await POST(request())).status).toBe(401);
  expect(initialize).not.toHaveBeenCalled();
});

test("refreshes public content only when import inserts the initial snapshot", async () => {
  initialize.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  expect(await (await POST(request())).json()).toEqual({ initialized: true, revalidated: true });
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(revalidatePath).toHaveBeenCalledWith("/blog/[slug]", "page");
  jest.mocked(revalidatePath).mockClear();
  expect(await (await POST(request())).json()).toEqual({ initialized: false, revalidated: true });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("reports a successful import even if cache refresh fails", async () => {
  initialize.mockResolvedValueOnce(true);
  jest.mocked(revalidatePath).mockImplementationOnce(() => { throw new Error("cache unavailable"); });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ initialized: true, revalidated: false });
});
