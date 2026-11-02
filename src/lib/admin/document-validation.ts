import "server-only";

/** The upload provider must still enforce authorization and private storage. */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export class DocumentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentValidationError";
  }
}

/** Validate content independently of the filename before a PDF reaches storage. */
export async function validatePdfUpload(file: Blob): Promise<void> {
  if (file.type !== "application/pdf" || file.size < 8 || file.size > MAX_PDF_BYTES) {
    throw new DocumentValidationError("Choose a PDF up to 20 MB.");
  }
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (![0x25, 0x50, 0x44, 0x46, 0x2d].every((byte, index) => header[index] === byte)) {
    throw new DocumentValidationError("The file contents do not match a PDF.");
  }
}
