import { describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
jest.mock("server-only", () => ({}), { virtual: true });
import { createAdminGuard, parseAdminSubjects } from "../access-control";
import { AdminForbiddenError, AdminUnauthorizedError } from "../content-http";
const request = new NextRequest("https://portfolio.example/admin");
describe("admin allowlist authorization", () => {
  it("fails closed without a configured admin and does not accept user-controlled role metadata", async () => {
    expect(parseAdminSubjects(undefined)).toEqual([]);
    const guard = createAdminGuard(
      async () =>
        ({
          subject: "ordinary-user",
          email: "owner@example.com",
          app_metadata: { role: "admin" },
        }) as never,
      [],
    );
    await expect(guard(request)).rejects.toBeInstanceOf(AdminForbiddenError);
  });
  it("requires a verified identity and an explicitly allowed subject", async () => {
    await expect(
      createAdminGuard(async () => null, ["owner-id"])(request),
    ).rejects.toBeInstanceOf(AdminUnauthorizedError);
    await expect(
      createAdminGuard(
        async () => ({ subject: "other-id", email: "owner@example.com" }),
        ["owner-id"],
      )(request),
    ).rejects.toBeInstanceOf(AdminForbiddenError);
    await expect(
      createAdminGuard(
        async () => ({ subject: "owner-id", email: "owner@example.com" }),
        ["owner-id"],
      )(request),
    ).resolves.toEqual({ subject: "owner-id", email: "owner@example.com" });
  });
  it("verifies the session again on every request and rejects malformed configuration", async () => {
    let active = true;
    const verify = jest.fn(async () =>
      active ? { subject: "owner-id" } : null,
    );
    const guard = createAdminGuard(
      verify,
      parseAdminSubjects("owner-id,owner-id"),
    );
    await guard(request);
    active = false;
    await expect(guard(request)).rejects.toBeInstanceOf(AdminUnauthorizedError);
    expect(verify).toHaveBeenCalledTimes(2);
    expect(() => parseAdminSubjects("owner-id, invalid space")).toThrow(
      "Invalid admin subject",
    );
  });
});
