"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface Props {
  listingId: string;
  amountInr: number;
  buyerName: string;
  buyerEmail?: string;
  onPaid: () => void;
}

export function RazorpayButton({ listingId, amountInr, buyerName, buyerEmail, onPaid }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      // 1. Create order on the backend (uses the seller's Razorpay keys)
      const { order, keyId } = await api<{
        order: { id: string; amount: number; currency: string };
        keyId: string;
      }>(`/payment/order/${listingId}`, { method: "POST" });

      // 2. Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }
      if (!window.Razorpay) {
        setError("Razorpay SDK failed to load. Please refresh and try again.");
        return;
      }

      // 3. Open Razorpay checkout (payment goes to seller's account)
      const rzp = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "ReLoop",
        description: "Verified used item",
        prefill: { name: buyerName, email: buyerEmail ?? "" },
        theme: { color: "#1eb877" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await api(`/payment/verify/${listingId}`, {
              method: "POST",
              body: JSON.stringify(resp),
            });
            onPaid();
          } catch (e) {
            setError(String(e));
          }
        },
      });
      rzp.open();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={pay} disabled={loading} className="btn-primary w-full justify-start text-sm">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        Pay ₹{amountInr}
      </button>
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>
      )}
    </div>
  );
}
