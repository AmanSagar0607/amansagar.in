import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

export type LoginLimiter = (
  request: Request,
  email: string,
) => Promise<boolean>;

// Atomic fixed windows across all instances. The global bucket covers every client,
// including requests without a trustworthy IP, and the account bucket limits targeting.
const script = `
local account = redis.call('INCR', KEYS[1])
if account == 1 then redis.call('EXPIRE', KEYS[1], 900) end
local total = redis.call('INCR', KEYS[2])
if total == 1 then redis.call('EXPIRE', KEYS[2], 900) end
if account > 10 or total > 100 then return 0 end
return 1
`;
export function createLoginLimiter(redis: Redis) {
  return async (_request: Request, email: string): Promise<boolean> => {
    const account = createHash("sha256")
      .update(email.trim().toLowerCase())
      .digest("hex");
    const result = await redis.eval(
      script,
      [`portfolio:login:account:${account}`, "portfolio:login:global"],
      [],
    );
    return result === 1;
  };
}

const developmentWindows = new Map<string, { count: number; expiresAt: number }>();
const developmentWindowMs = 15 * 60 * 1000;

/**
 * Local development must remain testable when an outbound sandbox or firewall
 * prevents access to Upstash. Production never uses this fallback: it always
 * fails closed if the shared, durable limiter is unavailable.
 */
export function withDevelopmentLimiterFallback(primary: LoginLimiter): LoginLimiter {
  return async (request, email) => {
    try {
      return await primary(request, email);
    } catch {
      const now = Date.now();
      const account = createHash("sha256")
        .update(email.trim().toLowerCase())
        .digest("hex");
      const keys = [`portfolio:login:account:${account}`, "portfolio:login:global"];
      let allowed = true;
      for (const key of keys) {
        const existing = developmentWindows.get(key);
        const window = existing && existing.expiresAt > now
          ? existing
          : { count: 0, expiresAt: now + developmentWindowMs };
        window.count += 1;
        developmentWindows.set(key, window);
        const limit = key === "portfolio:login:global" ? 100 : 10;
        if (window.count > limit) allowed = false;
      }
      return allowed;
    }
  };
}
