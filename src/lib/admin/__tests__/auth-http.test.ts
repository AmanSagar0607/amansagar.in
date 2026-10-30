jest.mock("server-only", () => ({}), { virtual: true });
import { NextRequest } from "next/server";
import { createAuthRouteHandlers, type AuthProvider } from "../auth-http";

const origin = "https://portfolio.example";
const loginRequest = (body: unknown, requestOrigin = origin) =>
  new NextRequest(`${origin}/api/admin/login`, {
    method: "POST",
    headers: { origin: requestOrigin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const credentials = {
  email: "admin@example.com",
  password: "private-password",
};
function setup(subject = "admin-1") {
  const signIn = jest.fn(async () => ({
    identity: { subject },
    cookies: [{ name: "session", value: "secret", maxAge: 3600 }],
  }));
  const signOut = jest.fn(async () => [
    { name: "session", value: "", maxAge: 0 },
  ]);
  const provider: AuthProvider = { signIn, signOut };
  const providerFor = jest.fn(async () => provider);
  const allowLogin = jest.fn(async () => true);
  const handlers = createAuthRouteHandlers({
    providerFor,
    allowLogin,
    adminSubjects: ["admin-1"],
    production: true,
  });
  return { ...handlers, signIn, signOut, providerFor, allowLogin };
}
test("issues protected cookies only after verified admin sign-in", async () => {
  const { login, signIn } = setup();
  const response = await login(loginRequest(credentials));
  expect(response.status).toBe(200);
  expect(signIn).toHaveBeenCalled();
  expect(await response.text()).not.toContain(credentials.password);
  expect(response.headers.get("cache-control")).toContain("no-store");
  const cookie = response.headers.get("set-cookie") || "";
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("Secure");
  expect(cookie).toContain("SameSite=lax");
});
test("rejects identities outside the admin allowlist without a session cookie", async () => {
  const response = await setup("other-user").login(loginRequest(credentials));
  expect(response.status).toBe(401);
  expect(response.headers.get("set-cookie")).toBeNull();
  expect(await response.json()).toEqual({ error: "Sign in failed." });
});
test("rejects cross-origin and oversized requests before contacting the provider", async () => {
  const { login, providerFor } = setup();
  expect(
    (await login(loginRequest(credentials, "https://other.example"))).status,
  ).toBe(403);
  expect(
    (await login(loginRequest({ ...credentials, password: "x".repeat(9000) })))
      .status,
  ).toBe(413);
  expect(providerFor).not.toHaveBeenCalled();
});
test("fails closed when the shared limiter denies a request", async () => {
  const { login, allowLogin, providerFor } = setup();
  allowLogin.mockResolvedValueOnce(false);
  expect((await login(loginRequest(credentials))).status).toBe(429);
  expect(providerFor).not.toHaveBeenCalled();
});
test("revokes and clears the session on same-origin logout", async () => {
  const { logout, signOut } = setup();
  const request = new NextRequest(`${origin}/api/admin/logout`, {
    method: "POST",
    headers: { origin },
  });
  const response = await logout(request);
  expect(response.status).toBe(200);
  expect(signOut).toHaveBeenCalled();
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
});
