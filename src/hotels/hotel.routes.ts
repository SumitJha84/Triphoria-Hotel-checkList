import { Router } from "express";
import { getHotels } from "./hotel.controller";

export const hotelRouter = Router();
hotelRouter.get("/", getHotels);
