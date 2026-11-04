/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
jest.mock("@/components/journey/activity-markdown", () => ({
  ActivityMarkdown: ({ content }: { content: string }) => <div>{content}</div>,
}));
import { PostEditor } from "../post-editor";
import { ProjectEditor } from "../project-editor";
import { TrackEditor } from "../track-editor";
import { ChallengeEditor } from "../challenge-editor";
import type { ManagedPost, ManagedProject } from "@/lib/admin/content-types";
import type { Activity, Challenge, Track } from "@/lib/journey/types";

const post: ManagedPost = {
  slug: "my-post",
  title: "My post",
  description: "Description",
  content: "Existing body",
  publishedAt: "2025-01-01",
  updatedAt: "2025-01-01",
  status: "draft",
  visibility: "private",
  frontmatter: { author: "Aman", tags: ["TypeScript"] },
};
const project: ManagedProject = {
  slug: "my-project",
  status: "draft",
  visibility: "private",
  updatedAt: "2025-01-01",
  project: {
    slug: "my-project",
    title: "My project",
    description: "Description",
    overview: "Overview",
    src: "https://example.com/image.png",
    link: "https://example.com",
    date: "2025-01-01",
    technologies: [
      { name: "TypeScript", icon: "typescript", category: "frontend" },
    ],
  },
};
const track: Track = {
  slug: "my-track",
  title: "My track",
  description: "Description",
  technologies: [],
  status: "active",
  visibility: "private",
  milestones: [{ id: "first", title: "First" }],
  projectSlugs: [],
};
const challenge: Challenge = {
  id: "my-challenge",
  title: "My challenge",
  category: "Learning",
  description: "",
  visibility: "private",
};

describe("admin editors", () => {
  it("saves an edited draft post without dropping existing metadata", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn(async () => {});
    render(<PostEditor initial={post} onSave={onSave} />);
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Updated post");
    await user.click(screen.getByRole("button", { name: "Save post" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated post",
        status: "draft",
        visibility: "private",
        frontmatter: post.frontmatter,
      }),
    );
    expect(await screen.findByText("Post saved.")).toHaveAttribute(
      "role",
      "status",
    );
  });
  it("preserves existing technology icons while adding new technologies", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn(async (value: ManagedProject) => {
      void value;
    });
    render(<ProjectEditor initial={project} onSave={onSave} />);
    const input = screen.getByLabelText(/Technologies/);
    await user.clear(input);
    await user.type(input, "TypeScript\nPython");
    await user.click(screen.getByRole("button", { name: "Save project" }));
    const saved = onSave.mock.calls[0][0] as ManagedProject;
    expect(saved.project.technologies).toEqual([
      { name: "TypeScript", icon: "typescript", category: "frontend" },
      { name: "Python", category: "other" },
    ]);
  });
  it("edits milestone IDs without losing focus and hides future activities", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn(async () => {});
    const future = {
      slug: "future",
      title: "Future note",
      status: "published",
      visibility: "public",
      sample: false,
      date: "2999-01-01",
    } as Activity;
    render(
      <TrackEditor
        initial={track}
        activities={[future]}
        projects={[]}
        onSave={onSave}
      />,
    );
    const id = screen.getByRole("textbox", { name: "ID" });
    await user.clear(id);
    await user.type(id, "new-id");
    expect(id).toHaveValue("new-id");
    expect(
      screen.queryByRole("option", { name: "Future note" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save track" }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        milestones: [expect.objectContaining({ id: "new-id" })],
      }),
    );
  });
  it("requires supporting evidence before saving a completed challenge", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn(async () => {});
    render(
      <ChallengeEditor initial={challenge} activities={[]} onSave={onSave} />,
    );
    fireEvent.change(screen.getByLabelText("Completion date"), {
      target: { value: "2025-01-01" },
    });
    await user.click(screen.getByRole("button", { name: "Save challenge" }));
    expect(screen.getByRole("alert")).toHaveTextContent("needs evidence");
    expect(onSave).not.toHaveBeenCalled();
    await user.type(
      screen.getByLabelText("Evidence URL"),
      "https://example.com/evidence",
    );
    await user.click(screen.getByRole("button", { name: "Save challenge" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  });
});
