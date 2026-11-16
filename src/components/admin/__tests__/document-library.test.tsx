/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { DocumentLibrary } from "../document-library";

jest.mock("@/lib/admin/client", () => ({
  listDocuments: jest.fn(async () => [
    {
      id: "123e4567-e89b-42d3-a456-426614174000",
      originalFilename: "resume.pdf",
      byteSize: 1024,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ]),
  uploadDocument: jest.fn(),
  renameDocument: jest.fn(),
  deleteDocument: jest.fn(),
}));

test("opens an in-place private preview with a copyable app URL", async () => {
  const user = userEvent.setup();
  render(<DocumentLibrary />);
  await user.click(
    await screen.findByRole("button", { name: "Preview resume.pdf" }),
  );
  const dialog = screen.getByRole("dialog");
  expect(
    within(dialog).getByTitle("Document preview: resume.pdf"),
  ).toHaveAttribute(
    "src",
    "/api/admin/documents/123e4567-e89b-42d3-a456-426614174000/preview",
  );
  expect(
    within(dialog).getByRole("link", { name: "Open in new tab" }),
  ).toHaveAttribute("target", "_blank");
  await user.click(
    within(dialog).getByRole("button", { name: "Copy private URL" }),
  );
  expect(within(dialog).getByRole("status")).toHaveTextContent(
    "admin session is required",
  );
});
