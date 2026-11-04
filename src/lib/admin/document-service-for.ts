import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { DocumentRepository } from "./document-repository";
import { DocumentService } from "./document-service";
import { createR2DocumentStore } from "./r2-document-store";
import { supabaseContentServiceFor } from "./supabase-content-service";

export async function documentServiceFor(
  request: NextRequest,
): Promise<DocumentService> {
  const content = await supabaseContentServiceFor(request);
  await content.authorize();
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret)
    throw new Error("Private document storage is not configured.");
  const authorize = () => content.authorize();
  const client = createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return new DocumentService(
    authorize,
    createR2DocumentStore(authorize),
    new DocumentRepository(client, authorize),
  );
}
