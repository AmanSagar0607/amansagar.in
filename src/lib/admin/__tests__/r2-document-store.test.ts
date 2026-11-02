jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: jest.fn(async () => "https://signed.example/temporary") }));
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { R2DocumentStore } from "../r2-document-store";

test("requires authorization and validates PDF content before upload", async () => {
  const send = jest.fn(async (command: unknown) => { void command; return {}; });
  const client = { send } as unknown as S3Client;
  const denied = new R2DocumentStore(client, "private-bucket", async () => { throw new Error("Unauthorized"); });
  await expect(denied.uploadPdf(new Blob(["%PDF-1.7"], { type: "application/pdf" }))).rejects.toThrow("Unauthorized");
  const store = new R2DocumentStore(client, "private-bucket", async () => {});
  await expect(store.uploadPdf(new Blob(["not a pdf"], { type: "application/pdf" }))).rejects.toThrow();
  expect(send).not.toHaveBeenCalled();
  const result = await store.uploadPdf(new Blob(["%PDF-1.7"], { type: "application/pdf" }));
  expect(result.key).toMatch(/^private\/documents\/[0-9a-f-]{36}\.pdf$/);
  expect(send.mock.calls[0][0]).toBeInstanceOf(PutObjectCommand);
});

test("does not sign arbitrary object keys", async () => {
  const store = new R2DocumentStore({} as S3Client, "private-bucket", async () => {});
  await expect(store.getPreviewUrl("public/other.pdf")).rejects.toThrow("Invalid document key.");
});
