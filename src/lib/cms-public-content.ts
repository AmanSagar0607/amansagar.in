import "server-only";
import { cache } from "react";
import { createPublicContentAdapter } from "@/lib/admin/public-adapter";
import { createSupabaseContentRepository } from "@/lib/admin/supabase-repository";
import { ContentNotInitializedError } from "@/lib/admin/versioned-repository";

/** Uses CMS data after its one-time import; prior to that, callers use local content. */
export const getCmsPublicContent = cache(async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)
    return null;
  try {
    const repository = createSupabaseContentRepository();
    await repository.read();
    return createPublicContentAdapter(() => repository.read());
  } catch (error) {
    if (error instanceof ContentNotInitializedError) return null;
    throw error;
  }
});
