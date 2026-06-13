import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  securityHeaders,
  corsMiddleware,
  apiLimiter,
  requestId,
} from "./middleware/security.js";
import authRoutes from "./routes/auth.js";
import returnRoutes from "./routes/returns.js";
import listingRoutes from "./routes/listings.js";
import lockerRoutes from "./routes/lockers.js";
import preventionRoutes from "./routes/prevention.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/products.js";
import paymentRoutes from "./routes/payment.js";
import notificationRoutes from "./routes/notifications.js";
import webhookRoutes from "./routes/webhooks.js";
import chatRoutes from "./routes/chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  await connectDb();
  const app = express();

  // --- Global middleware ---
  app.use(requestId);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(apiLimiter);
  app.use(express.json({ limit: env.isProd ? "5mb" : "20mb" }));

  // Request logging via pino (replaces morgan)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      logger[level]({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        requestId: (req as any).id,
      }, `${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  // --- Static files ---
  app.use("/static/uploads", express.static(path.join(__dirname, "..", "uploads")));

  // --- Health check (deep) ---
  app.get("/api/health", async (_req, res) => {
    const dbState = mongoose.connection.readyState; // 1 = connected
    const healthy = dbState === 1;
    res.status(healthy ? 200 : 503).json({
      ok: healthy,
      ts: Date.now(),
      mode: env.appMode,
      db: healthy ? "connected" : "disconnected",
      ai: env.aiProvider,
      storage: env.storageDriver,
      uptime: Math.round(process.uptime()),
    });
  });

  // --- Routes ---
  app.use("/api/auth", authRoutes);
  app.use("/api/returns", returnRoutes);
  app.use("/api/listings", listingRoutes);
  app.use("/api/lockers", lockerRoutes);
  app.use("/api/prevention", preventionRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/chat", chatRoutes);

  // --- Error handler (must be last) ---
  app.use(errorHandler);

  // --- Start ---
  app.listen(env.port, () => {
    logger.info({
      port: env.port,
      mode: env.appMode,
      ai: env.aiProvider,
      storage: env.storageDriver,
    }, `[reloop] backend ready on :${env.port} (mode=${env.appMode})`);
  });

  // --- Graceful shutdown ---
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully...");
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((e) => {
  logger.fatal(e, "Fatal startup error");
  process.exit(1);
});
