/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { SettingsScreen } from "../settings-screen";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

jest.mock("@/lib/admin/client", () => ({ saveContent: jest.fn() }));
jest.mock("sonner", () => ({ toast: { warning: jest.fn() } }));

test("removing a technology group keeps the remaining group's items", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen initial={{ ...defaultSiteSettings, technologyStack: [{ label: "First", items: ["Alpha"] }, { label: "Second", items: ["Beta"] }] }} />);
  await user.click(screen.getByRole("tab", { name: "Stack" }));
  const stack = screen.getByRole("group", { name: "Technology stack" });
  await user.click(within(stack).getByRole("button", { name: "Remove First" }));
  expect(within(stack).getByLabelText("Group name")).toHaveValue("Second");
  expect(within(stack).getByLabelText("Technologies (one per line)")).toHaveValue("Beta");
});
