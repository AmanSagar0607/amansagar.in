jest.mock("server-only", () => ({}), { virtual: true });
import { withDevelopmentLimiterFallback } from "../login-limiter";

test("uses an in-memory limiter only when the shared development limiter fails", async () => {
  const fallback = withDevelopmentLimiterFallback(async () => {
    throw new Error("network unavailable");
  });
  const request = new Request("http://localhost/api/admin/login");

  await expect(fallback(request, "admin@example.com")).resolves.toBe(true);
});
