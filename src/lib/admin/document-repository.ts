import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RequireAdmin } from "./content-service";

export type DocumentMetadata = {
  id: string;
  storageKey: string;
  originalFilename: string;
  byteSize: number;
  createdAt: string;
};

/** Metadata is private; callers must verify the admin session per request. */
export class DocumentRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly authorize: RequireAdmin,
  ) {}

  async list(): Promise<DocumentMetadata[]> {
    await this.authorize();
    const { data, error } = await this.client
      .from("portfolio_documents")
      .select("id, storage_key, original_filename, byte_size, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) throw new Error("Unable to load document metadata.");
    return data.map((row) => ({
      id: row.id,
      storageKey: row.storage_key,
      originalFilename: row.original_filename,
      byteSize: row.byte_size,
      createdAt: row.created_at,
    }));
  }

  async create(input: {
    id: string;
    storageKey: string;
    originalFilename: string;
    byteSize: number;
  }): Promise<void> {
    await this.authorize();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        input.id,
      ) ||
      input.storageKey !== `private/documents/${input.id}.pdf` ||
      !input.originalFilename.trim() ||
      input.originalFilename.length > 255 ||
      /[\u0000-\u001f\u007f/\\]/.test(input.originalFilename) ||
      !Number.isSafeInteger(input.byteSize) ||
      input.byteSize < 8 ||
      input.byteSize > 4 * 1024 * 1024
    )
      throw new Error("Invalid document metadata.");
    const { error } = await this.client
      .from("portfolio_documents")
      .insert({
        id: input.id,
        storage_key: input.storageKey,
        original_filename: input.originalFilename,
        byte_size: input.byteSize,
        mime_type: "application/pdf",
      });
    if (error) throw new Error("Unable to save document metadata.");
  }

  async find(id: string): Promise<DocumentMetadata | null> {
    await this.authorize();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
    )
      return null;
    const { data, error } = await this.client
      .from("portfolio_documents")
      .select("id, storage_key, original_filename, byte_size, created_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error("Unable to load document metadata.");
    return data
      ? {
          id: data.id,
          storageKey: data.storage_key,
          originalFilename: data.original_filename,
          byteSize: data.byte_size,
          createdAt: data.created_at,
        }
      : null;
  }

  async rename(id: string, originalFilename: string): Promise<void> {
    await this.authorize();
    if (
      !/^[0-9a-f-]{36}$/i.test(id) ||
      !originalFilename.trim() ||
      originalFilename.length > 255 ||
      /[\u0000-\u001f\u007f/\\]/.test(originalFilename)
    )
      throw new Error("Invalid document filename.");
    const { error } = await this.client
      .from("portfolio_documents")
      .update({ original_filename: originalFilename.trim() })
      .eq("id", id);
    if (error) throw new Error("Unable to rename document.");
  }

  async delete(id: string): Promise<void> {
    await this.authorize();
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid document id.");
    const { error } = await this.client
      .from("portfolio_documents")
      .delete()
      .eq("id", id);
    if (error) throw new Error("Unable to remove document metadata.");
  }
}
