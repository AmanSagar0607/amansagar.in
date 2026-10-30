import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createAdminGuard, type VerifiedIdentity } from "./access-control";
import { AdminForbiddenError, AdminUnauthorizedError } from "./content-http";

export interface SessionCookie {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
}
export interface LoginResult {
  identity: VerifiedIdentity;
  cookies: SessionCookie[];
}
export interface AuthProvider {
  /** The provider validates credentials and returns a verified identity plus server-side session cookies. */
  signIn(email: string, password: string): Promise<LoginResult | null>;
  /** Revoke the current session where possible and return cookies that clear it. */
  signOut(request: NextRequest): Promise<SessionCookie[]>;
}
export interface AuthRouteDependencies {
  providerFor: (request: NextRequest) => Promise<AuthProvider>;
  adminSubjects: readonly string[];
  /** A durable, shared limiter must cover both client and account; no permissive default is provided. */
  allowLogin: (request: NextRequest, email: string) => Promise<boolean>;
  production: boolean;
}
const noStore = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};
class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}
function respond(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: noStore });
}
function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new RequestError(403, "Same-origin request required.");
}
async function loginBody(
  request: NextRequest,
): Promise<{ email: string; password: string }> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get("content-type") || "",
    )
  )
    throw new RequestError(415, "Expected JSON content.");
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > 8192)
    throw new RequestError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 8192) {
      await reader.cancel();
      throw new RequestError(413, "Request is too large.");
    }
    chunks.push(part.value);
  }
  let data: unknown;
  try {
    data = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)),
    );
  } catch {
    throw new RequestError(400, "Invalid request.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new RequestError(400, "Invalid request.");
  const fields = data as Record<string, unknown>;
  if (
    typeof fields.email !== "string" ||
    fields.email.length > 320 ||
    !/^\S+@\S+\.\S+$/.test(fields.email) ||
    typeof fields.password !== "string" ||
    !fields.password ||
    fields.password.length > 1024
  )
    throw new RequestError(400, "Enter a valid email and password.");
  return { email: fields.email.trim(), password: fields.password };
}
function writeCookies(
  response: NextResponse,
  cookies: SessionCookie[],
  production: boolean,
) {
  if (!Array.isArray(cookies) || cookies.length > 20)
    throw new Error("Invalid provider cookies.");
  for (const cookie of cookies) {
    if (
      !cookie ||
      typeof cookie.name !== "string" ||
      !/^[!#$%&'*+.^_`|~A-Za-z0-9-]+$/.test(cookie.name) ||
      cookie.name.length > 256 ||
      typeof cookie.value !== "string" ||
      cookie.value.length > 4096 ||
      /[\u0000-\u001f\u007f;]/.test(cookie.value)
    )
      throw new Error("Invalid provider cookies.");
    if (
      cookie.maxAge !== undefined &&
      (!Number.isInteger(cookie.maxAge) ||
        cookie.maxAge < 0 ||
        cookie.maxAge > 60 * 60 * 24 * 30)
    )
      throw new Error("Invalid cookie lifetime.");
    if (
      cookie.expires !== undefined &&
      (!(cookie.expires instanceof Date) ||
        !Number.isFinite(cookie.expires.getTime()))
    )
      throw new Error("Invalid cookie expiry.");
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure:
        production ||
        cookie.name.startsWith("__Host-") ||
        cookie.name.startsWith("__Secure-"),
      sameSite: "lax",
      path: "/",
      ...(cookie.maxAge !== undefined ? { maxAge: cookie.maxAge } : {}),
      ...(cookie.expires ? { expires: cookie.expires } : {}),
    });
  }
}
function handle(error: unknown) {
  if (error instanceof RequestError)
    return respond({ error: error.message }, error.status);
  if (
    error instanceof AdminUnauthorizedError ||
    error instanceof AdminForbiddenError
  )
    return respond({ error: "Sign in failed." }, 401);
  return respond({ error: "Authentication is unavailable." }, 503);
}
/** Unmounted route handlers: each provider must perform real credential verification and session revocation. */
export function createAuthRouteHandlers(deps: AuthRouteDependencies) {
  async function login(request: NextRequest) {
    try {
      checkOrigin(request);
      const { email, password } = await loginBody(request);
      if (!(await deps.allowLogin(request, email)))
        return respond(
          { error: "Too many sign-in attempts. Try again later." },
          429,
        );
      const provider = await deps.providerFor(request);
      const session = await provider.signIn(email, password);
      if (!session) throw new AdminUnauthorizedError();
      const authorize = createAdminGuard(
        async () => session.identity,
        deps.adminSubjects,
      );
      await authorize(request);
      if (!session.cookies.length)
        throw new Error("Provider did not issue a session.");
      const response = respond({ success: true });
      writeCookies(response, session.cookies, deps.production);
      return response;
    } catch (error) {
      return handle(error);
    }
  }
  async function logout(request: NextRequest) {
    try {
      checkOrigin(request);
      const provider = await deps.providerFor(request);
      const cookies = await provider.signOut(request);
      const response = respond({ success: true });
      writeCookies(response, cookies, deps.production);
      return response;
    } catch (error) {
      return handle(error);
    }
  }
  return { login, logout };
}
