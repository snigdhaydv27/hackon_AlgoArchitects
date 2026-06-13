import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

// --- Helmet (security headers) ---
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // handled by Next.js on frontend
  crossOriginEmbedderPolicy: false,
});

// --- CORS ---
export const corsMiddleware = cors({
  origin: env.corsOrigins === "*"
    ? true
    : env.corsOrigins.split(",").map((s) => s.trim()),
  credentials: true,
  maxAge: 86400,
});

// --- Rate limiting ---
export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in demo mode for easier testing
    if (env.isDemo) return true;
    // Skip health checks
    if (req.path === "/api/health") return true;
    return false;
  },
  handler: (_req, res) => {
    res.status(429).json({ error: "Too many requests. Please slow down." });
  },
});

// --- Webhook HMAC verification ---
export function verifyWebhookSignature(secret: string): RequestHandler {
  return (req, res, next) => {
    // In demo mode, skip signature verification
    if (env.isDemo) {
      next();
      return;
    }
    const signature = req.headers["x-reloop-signature"] as string | undefined;
    if (!signature) {
      logger.warn({ path: req.path }, "Webhook request missing signature");
      res.status(401).json({ error: "Missing webhook signature" });
      return;
    }
    const body = JSON.stringify(req.body);
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    const valid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
    if (!valid) {
      logger.warn({ path: req.path }, "Webhook signature mismatch");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }
    next();
  };
}

// --- Request ID middleware ---
export const requestId: RequestHandler = (req, _res, next) => {
  (req as any).id = req.headers["x-request-id"] ?? crypto.randomUUID();
  next();
};
