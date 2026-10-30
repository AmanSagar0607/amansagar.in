import "server-only";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  ADMIN_ACCESS_COOKIE,
  createSupabaseAdminGuard,
} from "./supabase-admin-guard";
import { AdminForbiddenError, AdminUnauthorizedError } from "./content-http";
import { supabaseContentServiceFor } from "./supabase-content-service";

export async function adminPageContext() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  // Keep private routes from rendering a server error before deployment
  // configuration exists. The sign-in endpoint will still fail closed.
  if (!url || !key) redirect("/admin/login?reason=configuration");
  const request = new NextRequest("https://admin.internal/");
  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value;
  if (token) request.cookies.set(ADMIN_ACCESS_COOKIE, token);
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const guard = createSupabaseAdminGuard(client, process.env.ADMIN_SUBJECTS);
  let identity;
  try {
    identity = await guard(request);
  } catch (error) {
    if (
      error instanceof AdminUnauthorizedError ||
      error instanceof AdminForbiddenError
    )
      redirect("/admin/login");
    throw error;
  }
  return { identity, service: await supabaseContentServiceFor(request) };
}
