import "server-only";
import type { NextRequest } from "next/server";
import { AdminForbiddenError, AdminUnauthorizedError } from "./content-http";

/** Supplied only by an identity adapter that cryptographically verifies the session or calls its auth server. */
export interface VerifiedIdentity {
  subject: string;
  email?: string;
}
export type VerifyIdentity = (
  request: NextRequest,
) => Promise<VerifiedIdentity | null>;
const subjectPattern = /^[A-Za-z0-9._:@|\-]{1,255}$/;

/** An empty or malformed allowlist grants nobody access; registration never creates admin access. */
export function parseAdminSubjects(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const values = raw.split(",").map((value) => value.trim());
  if (values.some((value) => !subjectPattern.test(value)))
    throw new Error("Invalid admin subject configuration.");
  return [...new Set(values)];
}
export function createAdminGuard(
  verifyIdentity: VerifyIdentity,
  configuredSubjects: readonly string[],
) {
  if (
    configuredSubjects.some(
      (value) => typeof value !== "string" || !subjectPattern.test(value),
    )
  )
    throw new Error("Invalid admin subject configuration.");
  const allowed = new Set(configuredSubjects);
  return async (request: NextRequest): Promise<VerifiedIdentity> => {
    const identity = await verifyIdentity(request);
    if (!identity) throw new AdminUnauthorizedError();
    if (
      typeof identity.subject !== "string" ||
      !subjectPattern.test(identity.subject) ||
      !allowed.has(identity.subject)
    )
      throw new AdminForbiddenError();
    return {
      subject: identity.subject,
      ...(typeof identity.email === "string" && identity.email.length <= 320
        ? { email: identity.email }
        : {}),
    };
  };
}
