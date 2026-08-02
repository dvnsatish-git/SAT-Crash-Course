import { getRedisClient } from "./redisClient";

/** Fixed-window rate limit backed by Redis. Fails open if Redis is unavailable. */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return true;
  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= limit;
  } catch {
    return true;
  }
}
