jest.mock("server-only", () => ({}), { virtual: true });
import { DocumentService } from "../document-service";

const id = "123e4567-e89b-42d3-a456-426614174000";
const key = `private/documents/${id}.pdf`;
function setup() {
  const objects = { uploadPdf: jest.fn(async () => ({ key, mimeType: "application/pdf" as const, bytes: 20 })), getPreviewUrl: jest.fn(async () => "https://temporary.example/preview") };
  const metadata = { list: jest.fn(async () => []), find: jest.fn(async (_id: string) => ({ id, storageKey: key, originalFilename: "report.pdf", byteSize: 20, createdAt: "2026-01-01" })), create: jest.fn(async (_input: { id: string; storageKey: string; originalFilename: string; byteSize: number }) => {}) };
  return { objects, metadata, service: new DocumentService(async () => {}, objects, metadata) };
}

test("records uploaded private documents and looks up metadata before preview", async () => {
  const { service, metadata, objects } = setup();
  await expect(service.upload({ name: "report.pdf" } as File)).resolves.toEqual({ id });
  expect(metadata.create).toHaveBeenCalledWith({ id, storageKey: key, originalFilename: "report.pdf", byteSize: 20 });
  await expect(service.preview(id)).resolves.toBe("https://temporary.example/preview");
  expect(objects.getPreviewUrl).toHaveBeenCalledWith(key);
});

test("never signs an object if metadata does not exist", async () => {
  const { service, metadata, objects } = setup();
  metadata.find.mockResolvedValueOnce(null as never);
  await expect(service.preview(id)).resolves.toBeNull();
  expect(objects.getPreviewUrl).not.toHaveBeenCalled();
});
