import type { ErrorRequestHandler } from "express";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = (req as any).id ?? "unknown";
  const status = err.status ?? err.statusCode ?? 500;

  logger.error({
    err,
    requestId,
    method: req.method,
    url: req.url,
    status,
  }, err.message ?? "Unhandled error");

  // In production, don't leak error details to client
  const message = status >= 500
    ? `Internal server error: ${err.message ?? "unknown"}`
    : err.message ?? "Internal error";

  res.status(status).json({
    error: message,
    requestId,
    ...(env.isDemo && err.details ? { details: err.details } : {}),
  });
};
