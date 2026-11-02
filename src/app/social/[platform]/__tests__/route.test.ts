import { GET } from "../route";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/public-site-settings", () => ({ getPublicSiteSettings: jest.fn() }));
const settings = jest.mocked(getPublicSiteSettings);
const request = new Request("https://example.com/social/github");

test("redirects to the configured social URL without caching", async () => {
  settings.mockResolvedValue({ ...defaultSiteSettings, socialLinks: [{ label: "GitHub", handle: "@new", href: "https://github.com/new" }] });
  const response = await GET(request, { params: Promise.resolve({ platform: "github" }) });
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://github.com/new");
  expect(response.headers.get("cache-control")).toBe("no-store");
});

test("does not redirect when the social link was removed or the platform is unknown", async () => {
  settings.mockResolvedValue({ ...defaultSiteSettings, socialLinks: [] });
  expect((await GET(request, { params: Promise.resolve({ platform: "github" }) })).status).toBe(404);
  expect((await GET(request, { params: Promise.resolve({ platform: "unknown" }) })).status).toBe(404);
});
