import { revalidatePath } from "next/cache";
import { createContentRouteHandlers } from "@/lib/admin/content-http";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handlers = createContentRouteHandlers({
  serviceFor: supabaseContentServiceFor,
  async revalidate(targets) {
    for (const target of targets) revalidatePath(target.path, target.type);
  },
});
export const { GET, POST, PUT, DELETE } = handlers;
