import "server-only";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validatePdfUpload } from "./document-validation";
import type { RequireAdmin } from "./content-service";

export type StoredDocument = { key: string; mimeType: "application/pdf"; bytes: number };
export interface PrivateDocumentStore {
  uploadPdf(file: Blob): Promise<StoredDocument>;
  getPreviewUrl(key: string): Promise<string>;
}

/** Private R2 objects only. Persist returned metadata before exposing any object. */
export class R2DocumentStore implements PrivateDocumentStore {
  constructor(private readonly client: S3Client, private readonly bucket: string, private readonly authorize: RequireAdmin) {
    if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error("Invalid R2 bucket name.");
  }

  async uploadPdf(file: Blob): Promise<StoredDocument> {
    await this.authorize();
    await validatePdfUpload(file);
    const key = `private/documents/${randomUUID()}.pdf`;
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: Buffer.from(await file.arrayBuffer()), ContentType: "application/pdf", ContentDisposition: "attachment" }));
    return { key, mimeType: "application/pdf", bytes: file.size };
  }

  async getPreviewUrl(key: string): Promise<string> {
    await this.authorize();
    if (!/^private\/documents\/[0-9a-f-]{36}\.pdf$/.test(key)) throw new Error("Invalid document key.");
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key, ResponseContentType: "application/pdf", ResponseContentDisposition: "inline" }), { expiresIn: 60 });
  }
}

export function createR2DocumentStore(authorize: RequireAdmin): R2DocumentStore {
  const { R2_ACCOUNT_ID: accountId, R2_ACCESS_KEY_ID: accessKeyId, R2_SECRET_ACCESS_KEY: secretAccessKey, R2_BUCKET_NAME: bucket } = process.env;
  if (!accountId || !/^[a-f0-9]{32}$/.test(accountId) || !accessKeyId || !secretAccessKey || !bucket) throw new Error("R2 document storage is not configured.");
  return new R2DocumentStore(new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } }), bucket, authorize);
}
