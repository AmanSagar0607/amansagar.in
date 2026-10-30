/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { DeleteContentDialog } from "../delete-content-dialog";

describe("content deletion confirmation", () => {
  it("does not delete when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn(async () => {});
    render(<DeleteContentDialog title="Test post" onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Test post?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("reports deletion failures in the dialog instead of closing", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn(async () => {
      throw new Error("Still linked to a track");
    });
    render(<DeleteContentDialog title="Test post" onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Delete",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Still linked to a track",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
