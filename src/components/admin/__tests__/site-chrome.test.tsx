/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteChrome } from "@/components/site-chrome";
const location = { pathname: "/" };
jest.mock("next/navigation", () => ({ usePathname: () => location.pathname }));
function page() {
  return (
    <SiteChrome
      header={<header>Portfolio header</header>}
      dock={<nav>Mobile dock</nav>}
      footer={<footer>Portfolio footer</footer>}
    >
      <main>Page content</main>
    </SiteChrome>
  );
}
describe("portfolio and admin layout isolation", () => {
  it("preserves the public chrome", () => {
    location.pathname = "/projects";
    render(page());
    expect(screen.getByText("Portfolio header")).toBeInTheDocument();
    expect(screen.getByText("Mobile dock")).toBeInTheDocument();
    expect(screen.getByText("Portfolio footer")).toBeInTheDocument();
  });
  it("does not render public chrome inside admin routes", () => {
    location.pathname = "/admin/journey";
    render(page());
    expect(screen.queryByText("Portfolio header")).not.toBeInTheDocument();
    expect(screen.queryByText("Mobile dock")).not.toBeInTheDocument();
    expect(screen.queryByText("Portfolio footer")).not.toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
  it("does not confuse similarly prefixed public routes with admin", () => {
    location.pathname = "/administrator";
    render(page());
    expect(screen.getByText("Portfolio header")).toBeInTheDocument();
  });
});
