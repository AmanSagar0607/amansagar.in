/** @jest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { SettingsScreen } from "../settings-screen";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import { saveContent } from "@/lib/admin/client";

jest.mock("@/lib/admin/client", () => ({ saveContent: jest.fn() }));
jest.mock("sonner", () => ({ toast: { warning: jest.fn() } }));

test("saves updated profile and work experience with existing settings intact", async () => {
  const user = userEvent.setup();
  jest.mocked(saveContent).mockImplementation(async (_kind, record) => ({ record, revalidated: true }));
  render(<SettingsScreen initial={{ ...defaultSiteSettings }} />);
  const role = screen.getByLabelText("Profile role");
  await user.clear(role);
  await user.type(role, "Product Engineer");
  const companies = screen.getAllByLabelText("Company");
  await user.clear(companies[0]);
  await user.type(companies[0], "New company name");
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await waitFor(() => expect(saveContent).toHaveBeenCalledWith("settings", expect.objectContaining({ profileRole: "Product Engineer", workExperience: expect.arrayContaining([expect.objectContaining({ companyName: "New company name" })]), socialLinks: defaultSiteSettings.socialLinks }), "site"));
  expect(await screen.findByRole("status")).toHaveTextContent("Settings saved.");
});
