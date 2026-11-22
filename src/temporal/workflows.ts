import { proxyActivities } from "@temporalio/workflow";
import type { FinalHotel, Hotel } from "../hotels/hotel.types";

const activities = proxyActivities<{
  fetchSupplierA(city: string): Promise<Hotel[]>;
  fetchSupplierB(city: string): Promise<Hotel[]>;
  saveHotels(city: string, hotels: FinalHotel[]): Promise<void>;
}>({
  startToCloseTimeout: "10 seconds",
  scheduleToCloseTimeout: "25 seconds",
  retry: {
    maximumAttempts: 3,
    initialInterval: "1 second",
    maximumInterval: "5 seconds",
    backoffCoefficient: 2
  }
});

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function hotelOfferWorkflow(city: string): Promise<FinalHotel[]> {
  const results = await Promise.allSettled([
    activities.fetchSupplierA(city),
    activities.fetchSupplierB(city)
  ]);

  const supplierA = results[0].status === "fulfilled" ? results[0].value : [];
  const supplierB = results[1].status === "fulfilled" ? results[1].value : [];

  if (results.every((result) => result.status === "rejected")) {
    throw new Error("Both supplier services are unavailable");
  }

  const cheapest = new Map<string, FinalHotel>();
  for (const hotel of supplierA) {
    const key = normalizeName(hotel.name);
    cheapest.set(key, {
      name: hotel.name,
      price: hotel.price,
      supplier: "Supplier A",
      commissionPct: hotel.commissionPct
    });
  }
  for (const hotel of supplierB) {
    const key = normalizeName(hotel.name);
    const current = cheapest.get(key);
    if (!current || hotel.price < current.price) {
      cheapest.set(key, {
        name: hotel.name,
        price: hotel.price,
        supplier: "Supplier B",
        commissionPct: hotel.commissionPct
      });
    }
  }

  const finalHotels = Array.from(cheapest.values()).sort((a, b) => a.price - b.price);
  if (finalHotels.length === 0) {
    return [];
  }
  await activities.saveHotels(city, finalHotels);
  return finalHotels;
}
