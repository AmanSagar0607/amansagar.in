import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthProvider } from "./auth-http";
import { ADMIN_ACCESS_COOKIE } from "./supabase-admin-guard";
import { verifySupabaseAccessToken } from "./supabase-identity";

/** Request-scoped clients must not persist sessions in shared storage. */
export function createSupabaseAuthProvider(
  authClient: SupabaseClient,
  adminClient: SupabaseClient,
): AuthProvider {
  return {
    async signIn(email, password) {
      const { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session?.access_token) return null;
      const token = data.session.access_token;
      const identity = await verifySupabaseAccessToken(authClient, token);
      if (!identity) return null;
      const lifetime = Math.min(
        Math.max(
          Math.floor((data.session.expires_at ?? 0) - Date.now() / 1000),
          0,
        ),
        60 * 60 * 24 * 30,
      );
      if (!lifetime) return null;
      return {
        identity,
        cookies: [
          { name: ADMIN_ACCESS_COOKIE, value: token, maxAge: lifetime },
        ],
      };
    },
    async signOut(request) {
      const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
      if (token) {
        const { error } = await adminClient.auth.admin.signOut(token, "local");
        if (error && error.status !== 401 && error.status !== 403)
          throw new Error("Unable to revoke session.");
      }
      return [{ name: ADMIN_ACCESS_COOKIE, value: "", maxAge: 0 }];
    },
  };
}
