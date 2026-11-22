import express from "express";
import axios from "axios";
import { env } from "./config/env";
import { redis } from "./config/redis";
import { createTemporalClient } from "./config/temporal";
import { hotelRouter } from "./hotels/hotel.routes";
import { supplierARouter } from "./suppliers/supplierA.routes";
import { supplierBRouter } from "./suppliers/supplierB.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();
app.use(express.json());

app.use("/supplierA", supplierARouter);
app.use("/supplierB", supplierBRouter);
app.use("/api/hotels", hotelRouter);

app.get("/health", async (_req, res) => {
  const status: Record<string, "healthy" | "unhealthy"> = {
    express: "healthy",
    redis: "unhealthy",
    temporal: "unhealthy",
    supplierA: "unhealthy",
    supplierB: "unhealthy"
  };

  await Promise.allSettled([
    redis.ping().then(() => { status.redis = "healthy"; }),
    createTemporalClient().then(async (client) => {
      await client.workflow.list({ pageSize: 1 });
      status.temporal = "healthy";
    }),
    axios.get(`${env.SUPPLIER_A_URL}/supplierA/hotels`, { params: { city: "delhi" }, timeout: 3000 })
      .then(() => { status.supplierA = "healthy"; }),
    axios.get(`${env.SUPPLIER_B_URL}/supplierB/hotels`, { params: { city: "delhi" }, timeout: 3000 })
      .then(() => { status.supplierB = "healthy"; })
  ]);

  const criticalHealthy = status.redis === "healthy" && status.temporal === "healthy";
  res.status(criticalHealthy ? 200 : 503).json(status);
});

app.use(errorHandler);
