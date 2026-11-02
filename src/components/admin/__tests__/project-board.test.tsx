/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type { ManagedProject } from "@/lib/admin/content-types";
import { ProjectBoard } from "../project-board";

function project(slug: string, status: ManagedProject["status"], visibility: ManagedProject["visibility"]): ManagedProject {
  return {
    slug, status, visibility, updatedAt: "2026-01-01",
    project: { title: slug, slug, description: "Portfolio project", src: "", link: "", overview: "", date: "2026-01-01", technologies: [{ name: "TypeScript", category: "frontend" }], githubUrl: "https://github.com/example/repo" },
  };
}

test("groups real project states and filters projects by technology", async () => {
  const user = userEvent.setup();
  render(<ProjectBoard projects={[project("draft-project", "draft", "private"), project("private-project", "published", "private"), project("public-project", "published", "public")]} />);
  expect(within(screen.getByRole("region", { name: "Draft projects" })).getByRole("link", { name: "draft-project" })).toHaveAttribute("href", "/admin/projects/edit/draft-project");
  expect(within(screen.getByRole("region", { name: "Private projects" })).getByText("private-project")).toBeInTheDocument();
  expect(within(screen.getByRole("region", { name: "Published projects" })).getByText("public-project")).toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /Repository/ })).toHaveLength(3);
  await user.type(screen.getByLabelText("Search projects"), "missing");
  expect(screen.queryByText("public-project")).not.toBeInTheDocument();
  expect(screen.getAllByText("No projects in this column.")).toHaveLength(3);
});
