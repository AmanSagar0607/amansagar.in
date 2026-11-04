import "server-only";
import type { RequireAdmin } from "./content-service";
import type { DocumentMetadata } from "./document-repository";
import type { PrivateDocumentStore } from "./r2-document-store";

type DocumentMetadataStore = {
  list(): Promise<DocumentMetadata[]>;
  find(id: string): Promise<DocumentMetadata | null>;
  create(input: {
    id: string;
    storageKey: string;
    originalFilename: string;
    byteSize: number;
  }): Promise<void>;
  rename?(id: string, originalFilename: string): Promise<void>;
  delete?(id: string): Promise<void>;
};

/** Coordinates private objects and metadata; never returns keys to the public site. */
export class DocumentService {
  constructor(
    private readonly authorize: RequireAdmin,
    private readonly objects: PrivateDocumentStore,
    private readonly metadata: DocumentMetadataStore,
  ) {}

  async list() {
    await this.authorize();
    return (await this.metadata.list()).map(
      ({ storageKey: _storageKey, ...item }) => {
        void _storageKey;
        return item;
      },
    );
  }

  async upload(file: File): Promise<{ id: string }> {
    await this.authorize();
    if (
      !file.name.trim() ||
      file.name.length > 255 ||
      /[\u0000-\u001f\u007f/\\]/.test(file.name)
    )
      throw new Error("Invalid document filename.");
    const stored = await this.objects.uploadPdf(file);
    const id = stored.key.slice("private/documents/".length, -".pdf".length);
    // Do not delete on a metadata error: a timeout may occur after a successful insert.
    // Failed uploads require later reconciliation of any unreferenced private objects.
    await this.metadata.create({
      id,
      storageKey: stored.key,
      originalFilename: file.name,
      byteSize: stored.bytes,
    });
    return { id };
  }

  async preview(id: string): Promise<string | null> {
    await this.authorize();
    const document = await this.metadata.find(id);
    if (!document) return null;
    return this.objects.getPreviewUrl(document.storageKey);
  }

  async rename(id: string, filename: string): Promise<void> {
    await this.authorize();
    if (
      !filename.trim() ||
      filename.length > 255 ||
      /[\u0000-\u001f\u007f/\\]/.test(filename)
    )
      throw new Error("Invalid document filename.");
    const document = await this.metadata.find(id);
    if (!document) throw new Error("Document not found.");
    if (!this.metadata.rename)
      throw new Error("Document rename is unavailable.");
    await this.metadata.rename(id, filename.trim());
  }

  async delete(id: string): Promise<void> {
    await this.authorize();
    const document = await this.metadata.find(id);
    if (!document) throw new Error("Document not found.");
    if (!this.objects.delete || !this.metadata.delete)
      throw new Error("Document deletion is unavailable.");
    await this.objects.delete(document.storageKey);
    await this.metadata.delete(id);
  }
}
