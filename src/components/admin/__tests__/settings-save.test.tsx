/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { SettingsScreen } from "../settings-screen";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import { saveContent } from "@/lib/admin/client";

jest.mock("@/lib/admin/client", () => ({ saveContent: jest.fn() }));
jest.mock("sonner", () => ({ toast: { warning: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

test("saves updated profile and work experience with existing settings intact", async () => {
  const user = userEvent.setup();
  jest.mocked(saveContent).mockImplementation(async (_kind, record) => ({ record, revalidated: true }));
  render(<SettingsScreen initial={{ ...defaultSiteSettings }} />);
  await user.click(screen.getByRole("tab", { name: "Profile" }));
  const role = screen.getByLabelText("Profile role");
  await user.clear(role);
  await user.type(role, "Product Engineer");
  await user.click(screen.getByRole("tab", { name: "Experience" }));
  const companies = screen.getAllByLabelText("Company");
  await user.clear(companies[0]);
  await user.type(companies[0], "New company name");
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await waitFor(() => expect(saveContent).toHaveBeenCalledWith("settings", expect.objectContaining({ profileRole: "Product Engineer", workExperience: expect.arrayContaining([expect.objectContaining({ companyName: "New company name" })]), socialLinks: defaultSiteSettings.socialLinks }), "site"));
  expect(await screen.findByRole("status")).toHaveTextContent("Settings saved.");
});

test("opens the tab containing an invalid required field", async () => {
  const user = userEvent.setup();
  render(<SettingsScreen initial={{ ...defaultSiteSettings }} />);
  await user.click(screen.getByRole("tab", { name: "Profile" }));
  await user.clear(screen.getByLabelText("Profile role"));
  await user.click(screen.getByRole("tab", { name: "General" }));
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await waitFor(() => expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true"));
  expect(screen.getByRole("alert")).toHaveTextContent("Profile role");
  expect(screen.getByRole("alert").textContent).toMatch(/.+: .+/);
  expect(saveContent).not.toHaveBeenCalled();
});
