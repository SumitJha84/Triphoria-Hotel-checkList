import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { filterCachedHotels, getCachedHotels, runHotelWorkflow } from "./hotel.service";

const querySchema = z.object({
  city: z.enum(["delhi", "mumbai", "chennai"]),
  minPrice: z.coerce.number().finite().nonnegative().optional(),
  maxPrice: z.coerce.number().finite().nonnegative().optional()
});

export async function getHotels(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.query.city === undefined) {
      res.status(400).json({ error: "city is required", code: "INVALID_CITY" });
      return;
    }

    const parsed = querySchema.safeParse({
      city: String(req.query.city).toLowerCase().trim(),
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    });
    if (!parsed.success) {
      const field = parsed.error.errors[0]?.path[0];
      res.status(400).json({
        error: field === "city" ? "city must be delhi, mumbai, or chennai" : "minPrice and maxPrice must be non-negative numbers",
        code: field === "city" ? "INVALID_CITY" : "INVALID_PRICE"
      });
      return;
    }

    const { city, minPrice, maxPrice } = parsed.data;
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      res.status(400).json({ error: "minPrice cannot be greater than maxPrice", code: "INVALID_PRICE_RANGE" });
      return;
    }

    const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
    let cached = await getCachedHotels(city);

    if (!cached) {
      cached = await runHotelWorkflow(city);
    }

    if (hasPriceFilter) {
      const filtered = await filterCachedHotels(city, minPrice, maxPrice);
      res.json(filtered);
      return;
    }
    res.json(cached);
  } catch (error) {
    next(error);
  }
}
