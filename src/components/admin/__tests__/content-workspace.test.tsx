/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type {
  InitialContentSnapshot,
  ManagedPost,
} from "@/lib/admin/content-types";
import {
  ContentEdit,
  ContentList,
  isContentSection,
} from "../content-workspace";
import { deleteContent, saveContent } from "@/lib/admin/client";
const replace = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), warning: jest.fn() },
}));
jest.mock("@/lib/admin/client", () => ({
  saveContent: jest.fn(),
  deleteContent: jest.fn(),
}));
jest.mock("@/components/journey/activity-markdown", () => ({
  ActivityMarkdown: ({ content }: { content: string }) => <div>{content}</div>,
}));
const post: ManagedPost = {
  slug: "existing-post",
  title: "Existing post",
  description: "Existing description",
  content: "Existing body",
  publishedAt: "2025-01-01",
  updatedAt: "2025-01-01",
  status: "draft",
  visibility: "private",
  frontmatter: {},
};
const snapshot: InitialContentSnapshot = {
  posts: [post],
  projects: [],
  journey: {
    activities: [],
    tracks: [],
    challenges: [],
    awards: [],
    badgeRules: [],
  },
};
beforeEach(() => {
  jest.clearAllMocks();
});
describe("admin content workspace", () => {
  it("renders searchable content and valid create links", async () => {
    const user = userEvent.setup();
    render(<ContentList section="posts" snapshot={snapshot} />);
    expect(screen.getByRole("link", { name: "New post" })).toHaveAttribute(
      "href",
      "/admin/posts/new",
    );
    expect(screen.getByRole("link", { name: "Existing post" })).toHaveAttribute(
      "href",
      "/admin/posts/edit/existing-post",
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search content" }),
      "missing",
    );
    expect(screen.getByText("No blog posts found.")).toBeInTheDocument();
    expect(isContentSection("posts")).toBe(true);
    expect(isContentSection("__proto__")).toBe(false);
  });
  it("creates a post, locks its ID and updates it on a second save", async () => {
    const user = userEvent.setup();
    jest.mocked(saveContent).mockImplementation(async (_kind, record) => ({
      record,
      revalidated: true,
    }));
    render(<ContentEdit section="posts" id="new" snapshot={snapshot} />);
    await user.type(screen.getByLabelText("Title"), "New note");
    await user.type(screen.getByLabelText("Slug"), "new-note");
    await user.type(screen.getByLabelText("Description"), "Summary");
    await user.type(screen.getByLabelText(/Content \(Markdown\)/), "Body text");
    await user.click(screen.getByRole("button", { name: "Save post" }));
    expect(saveContent).toHaveBeenCalledWith(
      "post",
      expect.objectContaining({
        slug: "new-note",
        status: "draft",
        visibility: "private",
      }),
      undefined,
    );
    expect(replace).toHaveBeenCalledWith("/admin/posts/edit/new-note");
    expect(screen.getByLabelText("Slug")).toHaveAttribute("readonly");
    await user.click(screen.getByRole("button", { name: "Save post" }));
    expect(saveContent).toHaveBeenLastCalledWith(
      "post",
      expect.objectContaining({ slug: "new-note" }),
      "new-note",
    );
  });
  it("keeps deletion errors visible without losing the confirmation dialog", async () => {
    const user = userEvent.setup();
    jest.mocked(deleteContent).mockRejectedValue(new Error("Still linked"));
    render(
      <ContentEdit section="posts" id="existing-post" snapshot={snapshot} />,
    );
    expect(screen.getByLabelText("Slug")).toHaveAttribute("readonly");
    await user.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Still linked",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
  it("distinguishes a record named new from the create route", () => {
    const existing = { ...post, slug: "new", title: "A real record" };
    render(
      <ContentEdit
        section="posts"
        id="new"
        creating={false}
        snapshot={{ ...snapshot, posts: [existing] }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Edit post" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Slug")).toHaveValue("new");
    expect(screen.getByLabelText("Slug")).toHaveAttribute("readonly");
  });
});

it("labels future public posts as scheduled", () => {
  const future = {
    ...post,
    status: "published" as const,
    visibility: "public" as const,
    publishedAt: "2999-01-01",
  };
  const data: InitialContentSnapshot = { ...snapshot, posts: [future] };
  render(<ContentList section="posts" snapshot={data} />);
  expect(
    within(screen.getByRole("table")).getByText("Scheduled"),
  ).toBeInTheDocument();
});
