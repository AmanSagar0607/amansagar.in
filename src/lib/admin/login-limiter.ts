import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";

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
