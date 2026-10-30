/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MediaLibrary } from "../media-library";
import type { MediaAsset } from "@/lib/admin/media-service";
const image = (id: string): MediaAsset => ({
  id,
  publicId: `Aman-Portfolio/${id}`,
  url: `https://res.cloudinary.com/demo/image/upload/${id}.png`,
  format: "png",
  bytes: 1024,
  width: 100,
  height: 80,
  createdAt: "2025-01-01",
});
describe("media library", () => {
  it("searches loaded media and paginates without duplicate assets", async () => {
    const user = userEvent.setup();
    const list = jest.fn(async () => ({
      assets: [image("first"), image("second")],
    }));
    const upload = jest.fn(async () => image("new"));
    render(
      <MediaLibrary
        initial={{ assets: [image("first")], nextCursor: "cursor" }}
        actions={{ list, upload }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(list).toHaveBeenCalledWith("cursor");
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
    await user.type(
      screen.getByRole("searchbox", { name: "Search loaded media" }),
      "second",
    );
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
  });
  it("uploads selected images and displays provider errors", async () => {
    const user = userEvent.setup();
    const list = jest.fn(async () => ({ assets: [] }));
    const upload = jest.fn(async () => {
      throw new Error("Upload unavailable");
    });
    render(
      <MediaLibrary initial={{ assets: [] }} actions={{ list, upload }} />,
    );
    const file = new File(["image"], "photo.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Upload image"), file);
    expect(upload).toHaveBeenCalledWith(file);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Upload unavailable",
    );
  });
});
