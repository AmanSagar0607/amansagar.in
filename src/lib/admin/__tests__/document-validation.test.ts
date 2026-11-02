jest.mock("server-only", () => ({}), { virtual: true });
import { MAX_PDF_BYTES, validatePdfUpload } from "../document-validation";

test("accepts a PDF header with the expected MIME type", async () => {
  await expect(validatePdfUpload(new Blob(["%PDF-1.7\n"], { type: "application/pdf" }))).resolves.toBeUndefined();
});

test("rejects mismatched, oversized, and non-PDF uploads", async () => {
  await expect(validatePdfUpload(new Blob(["not a pdf"], { type: "application/pdf" }))).rejects.toThrow();
  await expect(validatePdfUpload(new Blob(["%PDF-1.7"], { type: "text/plain" }))).rejects.toThrow();
  await expect(validatePdfUpload(new Blob([new Uint8Array(MAX_PDF_BYTES + 1)], { type: "application/pdf" }))).rejects.toThrow();
});
