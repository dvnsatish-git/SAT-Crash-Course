import Redis from "ioredis";

let client: Redis | null | undefined;

function redisUrl(): string | undefined {
  // REDIS_URL is the standard name; Vercel Marketplace integrations (e.g. Redis
  // Cloud) inject a project-specific name like `<integration>_REDIS_URL` instead.
  const prefixed = Object.entries(process.env).find(([key]) => key.endsWith("_REDIS_URL"))?.[1];
  return process.env.REDIS_URL || prefixed;
}

/** Lazily creates a singleton ioredis client, or null if no REDIS_URL is configured. */
export function getRedisClient(): Redis | null {
  if (client !== undefined) return client;
  const url = redisUrl();
  if (!url) {
    client = null;
    return client;
  }
  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  });
  client.on("error", () => {
    // Swallow — callers already handle failures via try/catch on individual commands.
  });
  return client;
}
