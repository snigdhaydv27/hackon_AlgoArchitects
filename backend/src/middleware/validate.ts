import type { RequestHandler } from "express";
import { z, ZodSchema } from "zod";

/**
 * Express middleware that validates req.body against a Zod schema.
 * Returns 400 with structured errors on failure.
 */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware that validates req.query against a Zod schema.
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      res.status(400).json({ error: "Invalid query params", details: errors });
      return;
    }
    req.query = result.data;
    next();
  };
}

// --- Common schemas ---
export const schemas = {
  login: z.object({
    personaId: z.string().min(1, "personaId required"),
  }),
  returnCreate: z.object({
    productId: z.string().min(1, "productId required"),
  }),
  preventionCheck: z.object({
    productId: z.string().min(1),
    variant: z.string().min(1),
  }),
  webhookReturn: z.object({
    sellerId: z.string().min(1, "sellerId required"),
    productId: z.string().min(1, "productId required"),
  }),
  locationUpdate: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
  }).refine(
    (d) => (d.lat !== undefined && d.lng !== undefined) || (d.address && d.address.trim().length > 2),
    { message: "Provide lat+lng or address (min 3 chars)" }
  ),
  paymentVerify: z.object({
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    mock: z.boolean().optional(),
  }),
};
