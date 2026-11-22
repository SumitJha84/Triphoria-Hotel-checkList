import { Router } from "express";
import { mockHotels } from "./mockData";

export const supplierARouter = Router();

supplierARouter.get("/hotels", (req, res) => {
  const city = String(req.query.city || "").trim().toLowerCase();
  res.json(mockHotels[city]?.a || []);
});
