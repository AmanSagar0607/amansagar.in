/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MediaPicker } from "../media-picker";
import { listMedia } from "@/lib/admin/client";
jest.mock("@/lib/admin/client", () => ({
  listMedia: jest.fn(),
  uploadMedia: jest.fn(),
}));
const asset = {
  id: "one",
  publicId: "Aman-Portfolio/one",
  url: "https://res.cloudinary.com/dl7zgwx4o/image/upload/one.png",
  format: "png",
  bytes: 50,
  createdAt: "2025-01-01",
};
beforeEach(() => jest.clearAllMocks());
describe("media picker", () => {
  it("loads existing assets and selects a URL", async () => {
    const user = userEvent.setup();
    const select = jest.fn();
    jest.mocked(listMedia).mockResolvedValue({ assets: [asset] });
    render(<MediaPicker onSelect={select} />);
    await user.click(screen.getByRole("button", { name: "Choose image" }));
    const dialog = screen.getByRole("dialog", { name: "Choose an image" });
    expect(await within(dialog).findByText("one")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Select" }));
    expect(select).toHaveBeenCalledWith(asset.url);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("shows an error and supports retry", async () => {
    const user = userEvent.setup();
    jest
      .mocked(listMedia)
      .mockRejectedValueOnce(new Error("Media unavailable"))
      .mockResolvedValueOnce({ assets: [asset] });
    render(<MediaPicker onSelect={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Choose image" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Media unavailable",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("one")).toBeInTheDocument();
  });
});
