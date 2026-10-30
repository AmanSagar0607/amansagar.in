import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InitialContentSnapshot } from "./content-types";
import type {
  VersionedSnapshot,
  VersionedSnapshotStore,
} from "./versioned-repository";

/** Uses a server-only secret client. Callers must separately enforce admin authorization. */
export class SupabaseSnapshotStore implements VersionedSnapshotStore {
  constructor(private readonly client: SupabaseClient) {}
  async load(): Promise<VersionedSnapshot | null> {
    const { data, error } = await this.client
      .from("portfolio_cms_snapshot")
      .select("revision, content")
      .eq("singleton", true)
      .maybeSingle();
    if (error) throw new Error("Could not read CMS content.");
    if (!data) return null;
    if (
      typeof data.revision !== "string" ||
      !data.content ||
      typeof data.content !== "object" ||
      Array.isArray(data.content)
    )
      throw new Error("Invalid CMS content from storage.");
    return {
      revision: data.revision,
      content: data.content as InitialContentSnapshot,
    };
  }
  async insertIfAbsent(content: InitialContentSnapshot): Promise<boolean> {
    const { error } = await this.client
      .from("portfolio_cms_snapshot")
      .insert({ singleton: true, revision: randomUUID(), content });
    if (error?.code === "23505") return false;
    if (error) throw new Error("Could not initialize CMS content.");
    return true;
  }
  async compareAndSwap(
    expectedRevision: string,
    content: InitialContentSnapshot,
  ): Promise<boolean> {
    const { data, error } = await this.client
      .from("portfolio_cms_snapshot")
      .update({
        revision: randomUUID(),
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("singleton", true)
      .eq("revision", expectedRevision)
      .select("revision");
    if (error) throw new Error("Could not save CMS content.");
    return data.length === 1;
  }
}
