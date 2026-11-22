import axios from "axios";
import { env } from "../config/env";
import { FinalHotel, Hotel } from "../hotels/hotel.types";
import { saveHotelsToCache } from "../hotels/hotel.service";

export async function fetchSupplierA(city: string): Promise<Hotel[]> {
  const response = await axios.get<Hotel[]>(`${env.SUPPLIER_A_URL}/supplierA/hotels`, {
    params: { city },
    timeout: 5000
  });
  return response.data;
}

export async function fetchSupplierB(city: string): Promise<Hotel[]> {
  const response = await axios.get<Hotel[]>(`${env.SUPPLIER_B_URL}/supplierB/hotels`, {
    params: { city },
    timeout: 5000
  });
  return response.data;
}

export async function saveHotels(city: string, hotels: FinalHotel[]): Promise<void> {
  await saveHotelsToCache(city, hotels);
}
