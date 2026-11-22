import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
  TEMPORAL_ADDRESS: z.string().default("localhost:7233"),
  TEMPORAL_NAMESPACE: z.string().default("default"),
  TEMPORAL_TASK_QUEUE: z.string().default("hotel-offers"),
  SUPPLIER_A_URL: z.string().url().default("http://localhost:3000"),
  SUPPLIER_B_URL: z.string().url().default("http://localhost:3000")
});

export const env = envSchema.parse(process.env);
