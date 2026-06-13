import crypto from "node:crypto";
import { env } from "../config/env.js";

let razorpayClient: any = null;

async function client() {
  if (razorpayClient) return razorpayClient;
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET");
  }
  const Razorpay = (await import("razorpay")).default;
  razorpayClient = new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
  return razorpayClient;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export async function createOrder(opts: {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const c = await client();
  const order = await c.orders.create({
    amount: opts.amountInr * 100, // Razorpay wants paise
    currency: "INR",
    receipt: opts.receipt,
    notes: opts.notes,
    payment_capture: true,
  });
  return order;
}

export function verifySignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!env.razorpayKeySecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  return expected === opts.signature;
}

export function isConfigured(): boolean {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}
