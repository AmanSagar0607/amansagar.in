import type { SupabaseClient } from "@supabase/supabase-js";
jest.mock("server-only", () => ({}), { virtual: true });
import { verifySupabaseAccessToken } from "../supabase-identity";

it("only accepts a confirmed non-anonymous identity returned by the auth server", async () => {
  const getUser = jest.fn(async () => ({
    data: {
      user: {
        id: "admin-id",
        email: "owner@example.com",
        email_confirmed_at: "2026-01-01",
      },
    },
    error: null,
  }));
  const client = { auth: { getUser } } as unknown as SupabaseClient;
  expect(await verifySupabaseAccessToken(client, "token")).toEqual({
    subject: "admin-id",
    email: "owner@example.com",
  });
  expect(getUser).toHaveBeenCalledWith("token");
});
it("fails closed for missing, invalid or anonymous sessions", async () => {
  const getUser = jest.fn(async () => ({
    data: {
      user: { id: "id", email_confirmed_at: "2026-01-01", is_anonymous: true },
    },
    error: null,
  }));
  const client = { auth: { getUser } } as unknown as SupabaseClient;
  expect(await verifySupabaseAccessToken(client, undefined)).toBeNull();
  expect(await verifySupabaseAccessToken(client, "bad token")).toBeNull();
  expect(await verifySupabaseAccessToken(client, "token")).toBeNull();
  expect(getUser).toHaveBeenCalledTimes(1);
});
