jest.mock("server-only", () => ({}), { virtual: true });
import type { SupabaseClient } from "@supabase/supabase-js";
import { DocumentRepository } from "../document-repository";

const id = "123e4567-e89b-42d3-a456-426614174000";
const valid = { id, storageKey: `private/documents/${id}.pdf`, originalFilename: "report.pdf", byteSize: 20 };

test("authorization and metadata validation run before writing", async () => {
  const insert = jest.fn(async () => ({ error: null }));
  const client = { from: jest.fn(() => ({ insert })) } as unknown as SupabaseClient;
  const denied = new DocumentRepository(client, async () => { throw new Error("Unauthorized"); });
  await expect(denied.create(valid)).rejects.toThrow("Unauthorized");
  const repository = new DocumentRepository(client, async () => {});
  await expect(repository.create({ ...valid, originalFilename: "../report.pdf" })).rejects.toThrow("Invalid document metadata.");
  await expect(repository.create({ ...valid, storageKey: "public/report.pdf" })).rejects.toThrow("Invalid document metadata.");
  expect(insert).not.toHaveBeenCalled();
  await repository.create(valid);
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({ id, storage_key: valid.storageKey, mime_type: "application/pdf" }));
});
