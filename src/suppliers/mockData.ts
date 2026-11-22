import { Hotel } from "../hotels/hotel.types";

export const mockHotels: Record<string, { a: Hotel[]; b: Hotel[] }> = {
  delhi: {
    a: [
      { hotelId: "a1", name: "Holtin", price: 6000, city: "delhi", commissionPct: 10 },
      { hotelId: "a2", name: "Radison", price: 5900, city: "delhi", commissionPct: 13 },
      { hotelId: "a3", name: "The Imperial Crown", price: 8200, city: "delhi", commissionPct: 16 },
      { hotelId: "a4", name: "Lemon Tree Premier", price: 4800, city: "delhi", commissionPct: 12 },
      { hotelId: "a5", name: "Delhi Heights", price: 3500, city: "delhi", commissionPct: 9 }
    ],
    b: [
      { hotelId: "b1", name: "Holtin", price: 5340, city: "delhi", commissionPct: 20 },
      { hotelId: "b2", name: "Radison", price: 6100, city: "delhi", commissionPct: 15 },
      { hotelId: "b3", name: "The Imperial Crown", price: 7900, city: "delhi", commissionPct: 18 },
      { hotelId: "b4", name: "The Grand Stay", price: 4200, city: "delhi", commissionPct: 11 },
      { hotelId: "b5", name: "City Comfort Inn", price: 3200, city: "delhi", commissionPct: 8 }
    ]
  },
  mumbai: {
    a: [
      { hotelId: "ma1", name: "Sea View Plaza", price: 7200, city: "mumbai", commissionPct: 14 },
      { hotelId: "ma2", name: "Holtin", price: 6800, city: "mumbai", commissionPct: 12 },
      { hotelId: "ma3", name: "Marine Bay Hotel", price: 5400, city: "mumbai", commissionPct: 10 },
      { hotelId: "ma4", name: "Mumbai Central Inn", price: 3900, city: "mumbai", commissionPct: 8 },
      { hotelId: "ma5", name: "The Royal Palm", price: 9200, city: "mumbai", commissionPct: 17 }
    ],
    b: [
      { hotelId: "mb1", name: "Sea View Plaza", price: 7050, city: "mumbai", commissionPct: 16 },
      { hotelId: "mb2", name: "Holtin", price: 7100, city: "mumbai", commissionPct: 11 },
      { hotelId: "mb3", name: "Marine Bay Hotel", price: 5200, city: "mumbai", commissionPct: 13 },
      { hotelId: "mb4", name: "Bandra Boutique", price: 6300, city: "mumbai", commissionPct: 15 },
      { hotelId: "mb5", name: "Airport Residency", price: 3600, city: "mumbai", commissionPct: 9 }
    ]
  },
  chennai: { a: [], b: [] }
};
