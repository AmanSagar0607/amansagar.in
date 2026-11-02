import "server-only";
import type { RequireAdmin } from "./content-service";
import type { DocumentMetadata } from "./document-repository";
import type { PrivateDocumentStore } from "./r2-document-store";

type DocumentMetadataStore = {
  list(): Promise<DocumentMetadata[]>;
  find(id: string): Promise<DocumentMetadata | null>;
  create(input: { id: string; storageKey: string; originalFilename: string; byteSize: number }): Promise<void>;
};

/** Coordinates private objects and metadata; never returns keys to the public site. */
export class DocumentService {
  constructor(private readonly authorize: RequireAdmin, private readonly objects: PrivateDocumentStore, private readonly metadata: DocumentMetadataStore) {}

  async list() {
    await this.authorize();
    return (await this.metadata.list()).map(({ storageKey: _storageKey, ...item }) => { void _storageKey; return item; });
  }

  async upload(file: File): Promise<{ id: string }> {
    await this.authorize();
    if (!file.name.trim() || file.name.length > 255 || /[\u0000-\u001f\u007f/\\]/.test(file.name)) throw new Error("Invalid document filename.");
    const stored = await this.objects.uploadPdf(file);
    const id = stored.key.slice("private/documents/".length, -".pdf".length);
    // Do not delete on a metadata error: a timeout may occur after a successful insert.
    // Failed uploads require later reconciliation of any unreferenced private objects.
    await this.metadata.create({ id, storageKey: stored.key, originalFilename: file.name, byteSize: stored.bytes });
    return { id };
  }

  async preview(id: string): Promise<string | null> {
    await this.authorize();
    const document = await this.metadata.find(id);
    if (!document) return null;
    return this.objects.getPreviewUrl(document.storageKey);
  }
}
