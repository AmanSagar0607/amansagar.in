/** @jest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AdminSignIn } from "../admin-sign-in";

describe("private admin sign-in", () => {
  it("submits the supplied credentials without offering public registration", async () => {
    const user = userEvent.setup();
    const onSignIn = jest.fn(async () => {});
    render(<AdminSignIn onSignIn={onSignIn} />);
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "password-for-test");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onSignIn).toHaveBeenCalledWith(
      "owner@example.com",
      "password-for-test",
    );
    expect(
      screen.queryByRole("link", { name: /sign up|register/i }),
    ).not.toBeInTheDocument();
  });
  it("uses a generic failure message and clears the password", async () => {
    const user = userEvent.setup();
    const onSignIn = jest.fn(async () => {
      throw new Error("user not found");
    });
    render(<AdminSignIn onSignIn={onSignIn} />);
    await user.type(screen.getByLabelText("Email"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "password-for-test");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sign in failed",
    );
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByRole("alert")).not.toHaveTextContent("user not found");
  });
});
