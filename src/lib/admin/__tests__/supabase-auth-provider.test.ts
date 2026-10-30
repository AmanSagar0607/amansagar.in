import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
jest.mock("server-only", () => ({}), { virtual: true });
import { createSupabaseAuthProvider } from "../supabase-auth-provider";
import { ADMIN_ACCESS_COOKIE } from "../supabase-admin-guard";

it("verifies the Supabase identity before issuing a short-lived access cookie", async () => {
  const auth = {
    signInWithPassword: jest.fn(async () => ({
      data: {
        session: {
          access_token: "signed-token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      error: null,
    })),
    getUser: jest.fn(async () => ({
      data: { user: { id: "owner", email_confirmed_at: "2026-01-01" } },
      error: null,
    })),
  };
  const client = { auth } as unknown as SupabaseClient;
  const result = await createSupabaseAuthProvider(client, client).signIn(
    "owner@example.com",
    "secret",
  );
  expect(auth.getUser).toHaveBeenCalledWith("signed-token");
  expect(result?.identity.subject).toBe("owner");
  expect(result?.cookies[0]).toMatchObject({
    name: ADMIN_ACCESS_COOKIE,
    value: "signed-token",
  });
  expect(result?.cookies[0].maxAge).toBeLessThanOrEqual(3600);
});
it("revokes the current session and clears the cookie", async () => {
  const signOut = jest.fn(async () => ({ error: null }));
  const admin = { auth: { admin: { signOut } } } as unknown as SupabaseClient;
  const request = new NextRequest("https://example.com/api/admin/logout", {
    headers: { cookie: `${ADMIN_ACCESS_COOKIE}=signed-token` },
  });
  const cookies = await createSupabaseAuthProvider(admin, admin).signOut(
    request,
  );
  expect(signOut).toHaveBeenCalledWith("signed-token", "local");
  expect(cookies).toEqual([
    { name: ADMIN_ACCESS_COOKIE, value: "", maxAge: 0 },
  ]);
});
