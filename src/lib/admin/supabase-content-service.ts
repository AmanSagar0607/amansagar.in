import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { ContentService } from "./content-service";
import { createSupabaseAdminGuard } from "./supabase-admin-guard";
import { createSupabaseContentRepository } from "./supabase-repository";

/** Create a request-scoped service; each operation independently verifies the admin session. */
export async function supabaseContentServiceFor(
  request: NextRequest,
): Promise<ContentService> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("CMS authentication is not configured.");
  const authClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const guard = createSupabaseAdminGuard(
    authClient,
    process.env.ADMIN_SUBJECTS,
  );
  return new ContentService(createSupabaseContentRepository(), async () => {
    await guard(request);
  });
}
