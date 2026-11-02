/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ContentNotInitializedError } from "@/lib/admin/versioned-repository";
import AdminPage from "../page";
import { adminPageContext } from "@/lib/admin/admin-page-context";
import { AuthorizedDashboard } from "@/components/admin/authorized-workspace";

jest.mock("@/lib/admin/admin-page-context", () => ({ adminPageContext: jest.fn() }));
jest.mock("@/components/admin/authorized-workspace", () => ({ AuthorizedDashboard: jest.fn() }));
jest.mock("@/components/admin/admin-initialize", () => ({
  AdminInitialize: () => <div>Initialize portfolio content</div>,
}));

const context = adminPageContext as jest.MockedFunction<typeof adminPageContext>;
const dashboard = AuthorizedDashboard as jest.MockedFunction<typeof AuthorizedDashboard>;

beforeEach(() => {
  jest.clearAllMocks();
  context.mockResolvedValue({ service: {} } as Awaited<ReturnType<typeof adminPageContext>>);
});

test("shows initialization when the authenticated dashboard has no CMS content", async () => {
  dashboard.mockRejectedValue(new ContentNotInitializedError());
  render(await AdminPage());
  expect(screen.getByText("Initialize portfolio content")).toBeInTheDocument();
});

test("does not hide unrelated dashboard failures", async () => {
  dashboard.mockRejectedValue(new Error("Storage unavailable"));
  await expect(AdminPage()).rejects.toThrow("Storage unavailable");
});
