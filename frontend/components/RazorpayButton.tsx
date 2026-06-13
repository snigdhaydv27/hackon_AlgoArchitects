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
      // 1. Create order on the backend
      const { order, mock, keyId } = await api<{
        order: { id: string; amount: number; currency: string };
        mock: boolean;
        keyId?: string;
      }>(`/payment/order/${listingId}`, { method: "POST" });

      // Mock path — Razorpay not configured. Skip the SDK and verify directly.
      if (mock) {
        await new Promise((r) => setTimeout(r, 800));
        await api(`/payment/verify/${listingId}`, {
          method: "POST",
          body: JSON.stringify({ mock: true }),
        });
        onPaid();
        return;
      }

      // 2. Open Razorpay checkout
      if (!window.Razorpay) {
        setError("Razorpay SDK not loaded. Refresh and retry.");
        return;
      }
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
        Pay ₹{amountInr} via Razorpay
      </button>
      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>
      )}
      <div className="text-xs text-slate-500">
        Test mode — use card 4111 1111 1111 1111, any CVV, any future expiry. No real money moves.
      </div>
    </div>
  );
}
