import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminGuard, parseAdminSubjects } from "./access-control";
import { verifySupabaseAccessToken } from "./supabase-identity";

/** HttpOnly access token issued by the server-side login handler. */
export const ADMIN_ACCESS_COOKIE = "portfolio_admin_access";

/** Every request is verified with Supabase and checked against immutable admin user IDs. */
export function createSupabaseAdminGuard(
  client: SupabaseClient,
  adminSubjects: string | undefined,
) {
  return createAdminGuard(
    (request) =>
      verifySupabaseAccessToken(
        client,
        request.cookies.get(ADMIN_ACCESS_COOKIE)?.value,
      ),
    parseAdminSubjects(adminSubjects),
  );
}
