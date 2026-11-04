import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import { createArticleAiHandler } from "../article-ai";
import { AdminUnauthorizedError } from "../content-http";

function request(
  body: unknown = { action: "improve", title: "Article", content: "A draft" },
  origin = "https://example.com",
) {
  return new NextRequest("https://example.com/api/admin/ai", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
const config = () => ({ key: "test-only-key", model: "test-model" });
describe("article writing assistant", () => {
  it("rejects cross-origin and unauthenticated requests before contacting a provider", async () => {
    const fetcher = jest.fn();
    const authorize = jest.fn(async () => {
      throw new AdminUnauthorizedError();
    });
    const handler = createArticleAiHandler({
      authorize,
      fetch: fetcher,
      config,
    });
    expect(
      (await handler(request(undefined, "https://elsewhere.com"))).status,
    ).toBe(403);
    expect(authorize).not.toHaveBeenCalled();
    expect((await handler(request())).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("explains missing configuration without pretending to generate text", async () => {
    const handler = createArticleAiHandler({
      authorize: async () => {},
      config: () => ({}),
    });
    const response = await handler(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: expect.stringContaining("OPENAI_API_KEY"),
    });
  });
  it("validates actions and input lengths", async () => {
    const fetcher = jest.fn();
    const handler = createArticleAiHandler({
      authorize: async () => {},
      config,
      fetch: fetcher,
    });
    for (const body of [
      null,
      { action: "__proto__" },
      { action: "improve", title: "a", content: "a".repeat(100001) },
      { action: "custom", title: "a", content: "b" },
    ]) {
      expect((await handler(request(body))).status).toBe(400);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("returns a reviewable proposal without storing it or publishing content", async () => {
    const fetcher = jest.fn(async () =>
      Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: "## Improved draft" }],
          },
        ],
      }),
    );
    const handler = createArticleAiHandler({
      authorize: async () => {},
      config,
      fetch: fetcher as typeof fetch,
    });
    expect(await (await handler(request())).json()).toEqual({
      text: "## Improved draft",
    });
    const init = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(String(init.body))).toMatchObject({
      store: false,
      model: "test-model",
      max_output_tokens: 12000,
    });
  });
  it("rejects incomplete provider output instead of applying truncated prose", async () => {
    const handler = createArticleAiHandler({
      authorize: async () => {},
      config,
      fetch: (async () =>
        Response.json({ status: "incomplete", output: [] })) as typeof fetch,
    });
    expect((await handler(request())).status).toBe(502);
  });
});
