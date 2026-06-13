import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.logLevel,
  transport: env.isDev
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } }
    : undefined,
  base: { service: "reloop-backend", mode: env.appMode },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({ method: req.method, url: req.url, id: req.id }),
  },
});
