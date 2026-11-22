import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  const code = message.includes("Both supplier") ? "SUPPLIERS_UNAVAILABLE"
    : message.includes("Redis") || message.includes("ECONNREFUSED") ? "REDIS_UNAVAILABLE"
      : message.toLowerCase().includes("workflow") ? "WORKFLOW_FAILED"
        : "INTERNAL_ERROR";
  const status = code === "SUPPLIERS_UNAVAILABLE" ? 503 : code === "REDIS_UNAVAILABLE" ? 503 : 502;

  console.error(JSON.stringify({ level: "error", message, code }));
  res.status(status).json({ error: message, code });
};
