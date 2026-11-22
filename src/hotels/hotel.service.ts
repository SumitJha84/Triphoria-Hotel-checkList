import { randomUUID } from "node:crypto";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { createTemporalClient } from "../config/temporal";
import { FinalHotel } from "./hotel.types";

export function cacheKeys(city: string) {
  return {
    prices: `hotels:${city}:prices`,
    details: `hotels:${city}:details`
  };
}

export async function getCachedHotels(city: string): Promise<FinalHotel[] | null> {
  try {
    const keys = cacheKeys(city);
    const members = await redis.zrange(keys.prices, 0, -1);
    if (members.length === 0) return null;
    const values = await redis.hmget(keys.details, ...members);
    const hotels: FinalHotel[] = [];
    for (const value of values) {
      if (!value) continue;
      try {
        const hotel = JSON.parse(value) as FinalHotel;
        if (typeof hotel.name === "string" && typeof hotel.price === "number") hotels.push(hotel);
      } catch {
        // Ignore malformed entries and leave the remaining cache usable.
      }
    }
    return hotels.length > 0 ? hotels : null;
  } catch {
    return null;
  }
}

export async function filterCachedHotels(city: string, minPrice?: number, maxPrice?: number): Promise<FinalHotel[]> {
  const keys = cacheKeys(city);
  const min = minPrice === undefined ? "-inf" : String(minPrice);
  const max = maxPrice === undefined ? "+inf" : String(maxPrice);
  const members = await redis.zrangebyscore(keys.prices, min, max);
  if (members.length === 0) return [];
  const values = await redis.hmget(keys.details, ...members);
  const hotels: FinalHotel[] = [];
  for (const value of values) {
    if (!value) continue;
    try {
      const hotel = JSON.parse(value) as FinalHotel;
      if (typeof hotel.name === "string" && typeof hotel.price === "number") hotels.push(hotel);
    } catch {
      // Ignore malformed entries rather than failing the entire request.
    }
  }
  return hotels;
}

export async function saveHotelsToCache(city: string, hotels: FinalHotel[]): Promise<void> {
  const keys = cacheKeys(city);
  const pipeline = redis.pipeline();
  pipeline.del(keys.prices, keys.details);
  if (hotels.length > 0) {
    const zsetEntries: (string | number)[] = [];
    const normalizedNames = hotels.map((hotel) =>
      hotel.name.trim().toLowerCase().replace(/\s+/g, "-")
    );
    hotels.forEach((hotel, index) => {
      zsetEntries.push(hotel.price, normalizedNames[index]);
      pipeline.hset(keys.details, normalizedNames[index], JSON.stringify(hotel));
    });
    pipeline.zadd(keys.prices, ...zsetEntries);
  }
  pipeline.expire(keys.prices, env.CACHE_TTL_SECONDS);
  pipeline.expire(keys.details, env.CACHE_TTL_SECONDS);
  await pipeline.exec();
}

export async function runHotelWorkflow(city: string): Promise<FinalHotel[]> {
  const client = await createTemporalClient();
  const workflowId = `hotel-offers-${city}-${randomUUID()}`;
  return client.workflow.execute("hotelOfferWorkflow", {
    taskQueue: env.TEMPORAL_TASK_QUEUE,
    workflowId,
    args: [city],
    workflowExecutionTimeout: "30 seconds"
  });
}
