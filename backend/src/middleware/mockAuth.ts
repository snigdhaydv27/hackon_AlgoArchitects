import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface AuthedUser {
  id: string;
  role: "seller" | "buyer" | "admin" | "small_seller" | "locker";
  name: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthedUser;
  }
}

export function signToken(u: AuthedUser): string {
  return jwt.sign(u, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthedUser;
    req.user = payload;
    next();
  } catch (e) {
    logger.warn({ path: req.path }, "Invalid JWT token");
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export function requireRole(...roles: AuthedUser["role"][]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      logger.warn({ userId: req.user.id, role: req.user.role, required: roles }, "Forbidden: role mismatch");
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

/**
 * In demo mode, persona-based login is allowed (no password).
 * In production mode, this endpoint is disabled — use OAuth/Cognito instead.
 */
export function requireDemoMode(): RequestHandler {
  return (_req, res, next) => {
    if (!env.isDemo) {
      res.status(403).json({
        error: "Persona login is only available in demo mode. Use OAuth in production.",
      });
      return;
    }
    next();
  };
}
