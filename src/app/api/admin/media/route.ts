import { CloudinaryMediaProvider } from "@/lib/admin/media-service";
import { createMediaRouteHandlers } from "@/lib/admin/media-http";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createMediaRouteHandlers({
  async authorize(request) {
    await (await supabaseContentServiceFor(request)).authorize();
  },
  async providerFor(request) {
    const service = await supabaseContentServiceFor(request);
    return new CloudinaryMediaProvider(() => service.authorize());
  },
});

export const { GET, POST, PATCH, DELETE } = handlers;
