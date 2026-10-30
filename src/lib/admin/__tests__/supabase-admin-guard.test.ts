import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
jest.mock("server-only", () => ({}), { virtual: true });
import {
  createSupabaseAdminGuard,
  ADMIN_ACCESS_COOKIE,
} from "../supabase-admin-guard";
import { AdminForbiddenError, AdminUnauthorizedError } from "../content-http";

it("authorizes only an allowlisted verified Supabase user", async () => {
  const getUser = jest.fn(async () => ({
    data: { user: { id: "owner-id", email_confirmed_at: "2026-01-01" } },
    error: null,
  }));
  const client = { auth: { getUser } } as unknown as SupabaseClient;
  const request = new NextRequest("https://portfolio.example/admin", {
    headers: { cookie: `${ADMIN_ACCESS_COOKIE}=token` },
  });
  expect(await createSupabaseAdminGuard(client, "owner-id")(request)).toEqual({
    subject: "owner-id",
  });
  await expect(
    createSupabaseAdminGuard(client, "other-id")(request),
  ).rejects.toBeInstanceOf(AdminForbiddenError);
  await expect(
    createSupabaseAdminGuard(
      client,
      "owner-id",
    )(new NextRequest("https://portfolio.example/admin")),
  ).rejects.toBeInstanceOf(AdminUnauthorizedError);
});
