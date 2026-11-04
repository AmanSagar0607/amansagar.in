import { createArticleAiHandler } from "@/lib/admin/article-ai";
import { supabaseContentServiceFor } from "@/lib/admin/supabase-content-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const POST = createArticleAiHandler({
  async authorize(request) {
    await (await supabaseContentServiceFor(request)).authorize();
  },
});
