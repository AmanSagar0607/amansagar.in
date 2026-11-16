/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import { ForcedDarkPortalContext, ForcedLightPortalContext } from "./portal-theme";

test("admin dialogs keep dark theme when rendered in a portal", () => {
  render(<ForcedDarkPortalContext.Provider value><Dialog open><DialogContent><DialogTitle>Confirm</DialogTitle><DialogDescription>Review changes</DialogDescription></DialogContent></Dialog></ForcedDarkPortalContext.Provider>);
  expect(screen.getByRole("dialog")).toHaveClass("dark");
});

test("dialogs outside admin inherit the site theme", () => {
  render(<Dialog open><DialogContent><DialogTitle>Confirm</DialogTitle><DialogDescription>Review changes</DialogDescription></DialogContent></Dialog>);
  expect(screen.getByRole("dialog")).not.toHaveClass("dark");
});

test("drive dialogs force light theme even when document root is dark", () => {
  document.documentElement.classList.add("dark");
  try {
    render(<ForcedLightPortalContext.Provider value><Dialog open><DialogContent><DialogTitle>Preview</DialogTitle><DialogDescription>Private file</DialogDescription></DialogContent></Dialog></ForcedLightPortalContext.Provider>);
    expect(screen.getByRole("dialog")).toHaveClass("light");
    expect(screen.getByRole("dialog")).not.toHaveClass("dark");
  } finally {
    document.documentElement.classList.remove("dark");
  }
});
