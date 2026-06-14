import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing env var: ${name}`);
  return v;
}

export type AppMode = "demo" | "production";

export const env = {
  // --- Core ---
  port: Number(process.env.PORT ?? 8080),
  appMode: (process.env.APP_MODE ?? "demo") as AppMode,
  nodeEnv: process.env.NODE_ENV ?? "development",
  get isDemo() { return this.appMode === "demo"; },
  get isProd() { return this.appMode === "production"; },
  get isDev() { return this.nodeEnv !== "production"; },

  // --- Database ---
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/reloop"),

  // --- Auth ---
  jwtSecret: required("JWT_SECRET", "reloop-dev-secret-change-me"),
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as string | number,

  // --- AI ---
  aiProvider: (process.env.AI_PROVIDER ?? "gemini") as "gemini" | "mock",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",

  // --- Storage ---
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3Region: process.env.S3_REGION ?? "ap-south-1",
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://localhost:8080",

  // --- Payment ---
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",

  // --- Cognito (production auth) ---
  cognitoRegion: process.env.COGNITO_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
  cognitoClientId: process.env.COGNITO_CLIENT_ID ?? "",
  cognitoClientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",

  // --- Security ---
  corsOrigins: process.env.CORS_ORIGINS ?? "*", // comma-separated in production
  webhookSecret: process.env.WEBHOOK_SECRET ?? "reloop-webhook-dev-secret",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),

  // --- Logging ---
  logLevel: process.env.LOG_LEVEL ?? "info",
};
