import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("../store", () => ({
  getJourney: jest.fn(async () => ({
    activities: [],
    tracks: [],
    challenges: [],
    awards: [],
    badgeRules: [],
  })),
  saveJourney: jest.fn(async () => undefined),
}));
jest.mock("@/lib/projects", () => ({ getAllProjects: () => [] }));
jest.mock("@/lib/mdx-utils", () => ({ getMDXFiles: async () => [] }));
import { GET, PUT } from "@/app/api/admin/journey/route";
import { saveJourney } from "../store";
const original = process.env;
const token = "test-only-local-publishing-token-123456";
function request(
  method = "GET",
  authorized = true,
  origin = "http://localhost:3000",
  body?: string,
) {
  return new NextRequest("http://localhost:3000/api/admin/journey", {
    method,
    headers: {
      Origin: origin,
      ...(authorized ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
    ...(body ? { body } : {}),
  });
}
beforeEach(() => {
  jest.replaceProperty(process, "env", {
    ...original,
    NODE_ENV: "development",
    JOURNEY_ADMIN_TOKEN: token,
  });
  jest.clearAllMocks();
});
afterAll(() => {
  jest.replaceProperty(process, "env", original);
});
describe("local publishing authorization", () => {
  it("is disabled in production even with a valid token", async () => {
    jest.replaceProperty(process, "env", {
      ...original,
      NODE_ENV: "production",
      JOURNEY_ADMIN_TOKEN: token,
    });
    expect((await GET(request())).status).toBe(403);
  });
  it("rejects missing token and cross-origin requests", async () => {
    expect((await GET(request("GET", false))).status).toBe(401);
    expect(
      (await GET(request("GET", true, "https://external.example"))).status,
    ).toBe(403);
  });
  it("returns private editor data only after authorization with no caching", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("never mutates on unauthorized writes", async () => {
    expect(
      (await PUT(request("PUT", false, "http://localhost:3000", "{}"))).status,
    ).toBe(401);
    expect(saveJourney).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON and oversized bodies", async () => {
    expect(
      (await PUT(request("PUT", true, "http://localhost:3000", "{"))).status,
    ).toBe(400);
    expect(
      (
        await PUT(
          request("PUT", true, "http://localhost:3000", "x".repeat(1_048_577)),
        )
      ).status,
    ).toBe(413);
    expect(saveJourney).not.toHaveBeenCalled();
  });
  it("passes authorized writes through validated persistence", async () => {
    const response = await PUT(
      request("PUT", true, "http://localhost:3000", "{}"),
    );
    expect(response.status).toBe(200);
    expect(saveJourney).toHaveBeenCalledWith({});
  });
});
