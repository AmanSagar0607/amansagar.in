jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@/lib/public-site-settings", () => ({ getPublicSiteSettings: jest.fn() }));
jest.mock("@/lib/admin/r2-document-store", () => ({ createR2DocumentStore: jest.fn() }));
import { GET } from "./route";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { createR2DocumentStore } from "@/lib/admin/r2-document-store";
import { defaultSiteSettings, validateSiteSettings } from "@/lib/admin/site-settings";

const id = "123e4567-e89b-42d3-a456-426614174000";
const settings = { ...defaultSiteSettings, resumeVersions: [id], activeResumeId: id, resumeUrl: "https://example.com/backup" };
afterEach(() => { jest.restoreAllMocks(); });

test("streams only the selected resume without exposing its storage URL", async () => {
  jest.mocked(getPublicSiteSettings).mockResolvedValue(settings);
  const getPreviewUrl = jest.fn().mockResolvedValue("https://storage.example/signed");
  jest.mocked(createR2DocumentStore).mockReturnValue({ getPreviewUrl } as never);
  jest.spyOn(global, "fetch").mockResolvedValue(new Response("%PDF-1.7", { status: 200 }));
  const response = await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/pdf");
  expect(await response.text()).toBe("%PDF-1.7");
  expect(getPreviewUrl).toHaveBeenCalledWith(`private/documents/${id}.pdf`);
});

test("shows the backup link when storage fails", async () => {
  jest.mocked(getPublicSiteSettings).mockResolvedValue(settings);
  jest.mocked(createR2DocumentStore).mockImplementation(() => { throw new Error("offline"); });
  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.text()).toContain('href="https://example.com/backup"');
});

test("does not retrieve an unregistered document", async () => {
  jest.mocked(getPublicSiteSettings).mockResolvedValue({ ...settings, resumeVersions: [] });
  const response = await GET();
  expect(response.status).toBe(307);
  expect(response.headers.get("location")).toBe("https://example.com/backup");
});

test("persists valid versions and rejects a selected version outside the list", () => {
  expect(validateSiteSettings(settings)).toMatchObject({ resumeVersions: [id], activeResumeId: id });
  expect(() => validateSiteSettings({ ...settings, resumeVersions: [] })).toThrow("Invalid active resume version");
});
