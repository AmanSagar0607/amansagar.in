import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SupabaseSnapshotStore } from "./supabase-snapshot-store";
import { VersionedContentRepository } from "./versioned-repository";

/** Secret credentials stay on the server; missing configuration fails closed. */
export function createSupabaseContentRepository() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("CMS storage is not configured.");
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid CMS storage URL.");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== "/"
  )
    throw new Error("Invalid CMS storage URL.");
  const client = createClient(parsed.origin, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return new VersionedContentRepository(new SupabaseSnapshotStore(client));
}
