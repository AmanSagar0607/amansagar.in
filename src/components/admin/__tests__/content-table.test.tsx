/** @jest-environment jsdom */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { ContentTable } from "../content-table";

const rows = Array.from({ length: 12 }, (_, index) => ({
  id: String(index),
  href: `/admin/posts/${index}`,
  values: {
    title: `Post ${String(index + 1).padStart(2, "0")}`,
    status: index % 2 ? "Draft" : "Published",
  },
}));
const columns = [
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status", sortable: true },
];

describe("admin content table", () => {
  it("searches real rows and exposes an empty state", async () => {
    const user = userEvent.setup();
    render(<ContentTable rows={rows} columns={columns} />);
    await user.type(
      screen.getByRole("searchbox", { name: "Search content" }),
      "Post 11",
    );
    expect(screen.getByRole("link", { name: "Post 11" })).toHaveAttribute(
      "href",
      "/admin/posts/10",
    );
    expect(screen.getByText("1 result")).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search content" }));
    await user.type(
      screen.getByRole("searchbox", { name: "Search content" }),
      "unknown",
    );
    expect(screen.getByText("No content found.")).toBeInTheDocument();
  });
  it("sorts by the selected column and paginates", async () => {
    const user = userEvent.setup();
    render(<ContentTable rows={rows} columns={columns} />);
    expect(
      screen.queryByRole("link", { name: "Post 11" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByRole("link", { name: "Post 11" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Title" }));
    await user.click(screen.getByRole("button", { name: "Title" }));
    const body = screen.getAllByRole("rowgroup")[1];
    expect(within(body).getAllByRole("row")[0]).toHaveTextContent("Post 12");
    expect(screen.getByRole("columnheader", { name: /Title/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });
  it("filters records by status", async () => {
    const user = userEvent.setup();
    render(
      <ContentTable
        rows={rows}
        columns={columns}
        filters={[
          { key: "status", label: "Status", options: ["Draft", "Published"] },
        ]}
      />,
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "Draft",
    );
    expect(screen.getByText("6 results")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Post 01" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Post 02" })).toBeInTheDocument();
  });
});
