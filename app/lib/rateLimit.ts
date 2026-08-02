import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch {
  redis = null;
}

/** Fixed-window rate limit backed by Upstash Redis. Fails open if Redis is unavailable. */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  if (!redis) return true;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= limit;
  } catch {
    return true;
  }
}
