/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MediaScreen } from "../media-screen";
import { listDocuments } from "@/lib/admin/client";

jest.mock("@/lib/admin/client", () => ({ listMedia: jest.fn(async () => ({ assets: [] })), listDocuments: jest.fn(async () => []), uploadMedia: jest.fn(), renameMedia: jest.fn(), deleteMedia: jest.fn() }));
jest.mock("../media-library", () => ({ MediaLibrary: () => <div>Image library</div> }));
jest.mock("../document-library", () => ({ DocumentLibrary: () => <div>PDF library</div> }));

test("navigates the separate workspace and labels loaded storage accurately", async () => {
  const user = userEvent.setup();
  render(<MediaScreen initial={{ assets: [] }} />);
  expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("link", { name: "Back to Studio" })).toHaveAttribute("href", "/admin");
  expect(screen.getByText(/not total storage usage/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Private PDFs" }));
  expect(screen.getByText("PDF library")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Public images" }));
  expect(screen.getByText("Image library")).toBeInTheDocument();
});

test("sorts and switches layouts for loaded files", async () => {
  const user = userEvent.setup();
  jest.mocked(listDocuments).mockResolvedValueOnce([
    { id: "1", originalFilename: "Z.pdf", byteSize: 20, createdAt: "2026-11-01" },
    { id: "2", originalFilename: "A.pdf", byteSize: 10, createdAt: "2026-11-02" },
  ]);
  render(<MediaScreen initial={{ assets: [] }} />);
  await screen.findByText("A.pdf");
  expect(screen.getByTitle("Thumbnail: A.pdf")).toHaveAttribute("src", expect.stringContaining("/api/admin/documents/2/preview"));
  await user.selectOptions(screen.getByLabelText("Sort by"), "name");
  await user.click(screen.getByRole("button", { name: "Grid view" }));
  expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute("aria-pressed", "true");
  const section = screen.getByRole("region", { name: "Loaded files" });
  expect(within(section).getAllByRole("listitem").map((item) => item.textContent)).toEqual([expect.stringContaining("A.pdf"), expect.stringContaining("Z.pdf")]);
});

test("reports failed PDF loads and retries", async () => {
  const user = userEvent.setup();
  jest.mocked(listDocuments).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  render(<MediaScreen initial={{ assets: [] }} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not load private PDFs.");
  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText(/No files loaded yet/)).toBeInTheDocument();
});
