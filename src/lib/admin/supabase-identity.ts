import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { VerifiedIdentity } from "./access-control";

/** Resolve identities using Supabase Auth, never the unverified contents of a cookie. */
export async function verifySupabaseAccessToken(
  client: SupabaseClient,
  token: string | undefined,
): Promise<VerifiedIdentity | null> {
  if (!token || token.length > 4096 || /\s/.test(token)) return null;
  const { data, error } = await client.auth.getUser(token);
  if (
    error ||
    !data.user ||
    !data.user.id ||
    !data.user.email_confirmed_at ||
    data.user.is_anonymous
  )
    return null;
  return {
    subject: data.user.id,
    ...(data.user.email ? { email: data.user.email } : {}),
  };
}
