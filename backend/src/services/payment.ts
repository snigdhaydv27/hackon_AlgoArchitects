import crypto from "node:crypto";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

// Create a Razorpay order using the seller's own credentials
export async function createOrderWithSellerKeys(
  keys: { keyId: string; keySecret: string },
  opts: { amountInr: number; receipt: string; notes?: Record<string, string> }
): Promise<RazorpayOrder> {
  const Razorpay = (await import("razorpay")).default;
  const client = new Razorpay({
    key_id: keys.keyId,
    key_secret: keys.keySecret,
  });
  const order = await (client as any).orders.create({
    amount: opts.amountInr * 100, // Razorpay wants paise
    currency: "INR",
    receipt: opts.receipt,
    notes: opts.notes,
    payment_capture: true,
  });
  return order;
}

// Verify signature using the seller's secret
export function verifySignatureWithSecret(
  secret: string,
  opts: { orderId: string; paymentId: string; signature: string }
): boolean {
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  return expected === opts.signature;
}
