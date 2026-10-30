/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AdminShell } from "../admin-shell";
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/posts/edit/example",
}));

describe("admin navigation", () => {
  it("shows the active section and preserves accessible names when collapsed", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell email="owner@example.com" signOut={async () => {}}>
        <h1>Content</h1>
      </AdminShell>,
    );
    const nav = screen.getByRole("navigation", { name: "Admin navigation" });
    expect(
      within(nav).getByRole("link", { name: "Blog posts" }),
    ).toHaveAttribute("aria-current", "page");
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(nav).getByRole("link", { name: "Blog posts" }),
    ).toBeInTheDocument();
  });
  it("opens accessible mobile navigation and closes on selection", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell email="owner@example.com" signOut={async () => {}}>
        <h1>Content</h1>
      </AdminShell>,
    );
    await user.click(
      screen.getByRole("button", { name: "Open admin navigation" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Admin navigation" });
    expect(
      within(dialog).getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("href", "/admin/projects");
    const link = within(dialog).getByRole("link", { name: "Projects" });
    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
