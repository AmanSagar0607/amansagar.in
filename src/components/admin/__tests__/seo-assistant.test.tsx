/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { SeoAssistant } from "../seo-assistant";
import type { ManagedPost } from "@/lib/admin/content-types";

jest.mock("@/components/journey/activity-markdown", () => ({
  ActivityMarkdown: ({ content }: { content: string }) => <div>{content}</div>,
}));
const post: ManagedPost = { slug: "article", title: "Article", description: "An article", content: "## Original\n\nDraft body.", publishedAt: "2026-01-01", updatedAt: "2026-01-01", status: "draft", visibility: "private", frontmatter: {} };
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

it("keeps an AI proposal separate until the author applies it", async () => {
  const user = userEvent.setup();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ text: "## Improved\n\nA clearer draft." }) });
  const apply = jest.fn();
  render(<SeoAssistant post={post} onContent={apply} onSeo={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "Generate suggestion" }));
  const button = await screen.findByRole("button", { name: "Replace article with proposal" });
  expect(apply).not.toHaveBeenCalled();
  await user.click(button);
  expect(apply).toHaveBeenCalledWith("## Improved\n\nA clearer draft.");
  expect(screen.getByRole("status")).toHaveTextContent("Applied to the draft");
});

it("prevents applying a suggestion generated for an older article version", async () => {
  const user = userEvent.setup();
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ text: "Suggested rewrite" }) });
  const apply = jest.fn();
  const props = { onContent: apply, onSeo: jest.fn() };
  const { rerender } = render(<SeoAssistant post={post} {...props} />);
  await user.click(screen.getByRole("button", { name: "Generate suggestion" }));
  await screen.findByRole("button", { name: "Replace article with proposal" });
  rerender(<SeoAssistant post={{ ...post, content: "Newer manual edit" }} {...props} />);
  expect(screen.getByRole("button", { name: "Replace article with proposal" })).toBeDisabled();
  expect(apply).not.toHaveBeenCalled();
});

it("shows missing-provider errors without claiming a suggestion was generated", async () => {
  const user = userEvent.setup();
  global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "AI writing is not configured." }) });
  render(<SeoAssistant post={post} onContent={jest.fn()} onSeo={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "Generate suggestion" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("AI writing is not configured.");
  expect(screen.queryByRole("button", { name: "Replace article with proposal" })).not.toBeInTheDocument();
});
