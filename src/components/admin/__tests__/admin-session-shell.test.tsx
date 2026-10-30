/** @jest-environment jsdom */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AdminSessionShell } from "../admin-session-shell";
import { signOut } from "@/lib/admin/client";

const replace = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({ replace, refresh }),
}));
jest.mock("@/lib/admin/client", () => ({ signOut: jest.fn() }));
const mockedSignOut = jest.mocked(signOut);
beforeEach(() => {
  jest.clearAllMocks();
});

async function chooseSignOut() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Account menu" }));
  await user.click(screen.getByRole("button", { name: "Sign out" }));
}
test("redirects only after logout succeeds", async () => {
  mockedSignOut.mockResolvedValueOnce();
  render(
    <AdminSessionShell email="owner@example.com">
      <h1>Dashboard</h1>
    </AdminSessionShell>,
  );
  await chooseSignOut();
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin/login"));
  expect(refresh).toHaveBeenCalled();
});
test("shows an error and keeps the current page when logout fails", async () => {
  mockedSignOut.mockRejectedValueOnce(new Error("unavailable"));
  render(
    <AdminSessionShell email="owner@example.com">
      <h1>Dashboard</h1>
    </AdminSessionShell>,
  );
  await chooseSignOut();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not sign out",
  );
  expect(replace).not.toHaveBeenCalled();
});
