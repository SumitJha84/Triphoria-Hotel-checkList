import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: false,
  maxRetriesPerRequest: 2
});

let lastRedisErrorLog = 0;
redis.on("error", (error) => {
  const now = Date.now();
  if (now - lastRedisErrorLog >= 10_000) {
    lastRedisErrorLog = now;
    console.error(JSON.stringify({
      level: "error",
      message: "Redis connection error",
      error: error.message || "Redis is unreachable"
    }));
  }
});
