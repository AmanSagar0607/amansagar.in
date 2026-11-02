import "server-only";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { createAuthRouteHandlers } from "./auth-http";
import { parseAdminSubjects } from "./access-control";
import {
  createLoginLimiter,
  withDevelopmentLimiterFallback,
} from "./login-limiter";
import { createSupabaseAuthProvider } from "./supabase-auth-provider";

export function configuredAuthHandlers() {
  const {
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: key,
    SUPABASE_SECRET_KEY: secret,
    UPSTASH_REDIS_REST_URL: redisUrl,
    UPSTASH_REDIS_REST_TOKEN: redisToken,
    ADMIN_SUBJECTS: subjects,
  } = process.env;
  if (!url || !key || !secret || !redisUrl || !redisToken || !subjects)
    throw new Error("Admin authentication is not configured.");
  const adminSubjects = parseAdminSubjects(subjects);
  if (!adminSubjects.length)
    throw new Error("Admin authentication is not configured.");
  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  };
  const sharedLimiter = createLoginLimiter(
    new Redis({ url: redisUrl, token: redisToken }),
  );
  const production = process.env.NODE_ENV === "production";
  return createAuthRouteHandlers({
    providerFor: async () =>
      createSupabaseAuthProvider(
        createClient(url, key, options),
        createClient(url, secret, options),
      ),
    adminSubjects,
    allowLogin: production
      ? sharedLimiter
      : withDevelopmentLimiterFallback(sharedLimiter),
    production,
  });
}
