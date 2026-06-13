import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);

  // Connection options for production resilience
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.isDemo, // disable auto-index in production (create via migration)
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  logger.info({ uri: env.mongoUri.replace(/\/\/[^@]+@/, "//***:***@") }, "[db] connected");

  mongoose.connection.on("error", (err) => {
    logger.error(err, "[db] connection error");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("[db] disconnected");
  });
}
