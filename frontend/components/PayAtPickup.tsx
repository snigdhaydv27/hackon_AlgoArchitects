"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, MapPin, QrCode, IndianRupee } from "lucide-react";

interface Props {
  listingId: string;
  amountInr: number;
  lockerName?: string;
  onPaid: () => void;
}

export function PayAtPickup({ listingId, amountInr, lockerName, onPaid }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayAtPickup() {
    setError(null);
    setLoading(true);
    try {
      await api(`/payment/pay-at-pickup/${listingId}`, { method: "POST" });
      setConfirmed(true);
      onPaid();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
          <QrCode className="size-4" />
          Pay at Pickup confirmed
        </div>
        <p className="text-xs text-emerald-700">
          Visit <span className="font-medium">{lockerName || "the locker"}</span>, enter your pickup code, and pay ₹{amountInr} via UPI at the kiosk. The locker unlocks after payment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
          <MapPin className="size-4" />
          Pay at Pickup (UPI at Locker)
        </div>
        <p className="text-xs text-amber-700 mt-1">
          This seller hasn&apos;t set up online payments yet. You can pay ₹{amountInr} via UPI at the locker when you collect your item.
        </p>
        <ul className="mt-2 text-xs text-amber-700 space-y-1">
          <li className="flex items-start gap-1.5">
            <span>•</span> Reserve the item now — it&apos;s held for you
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span> Visit {lockerName || "the locker"} with your pickup code
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span> Scan the UPI QR at the locker kiosk to pay ₹{amountInr}
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span> Locker unlocks automatically after payment confirmation
          </li>
        </ul>
      </div>

      <button
        onClick={confirmPayAtPickup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <IndianRupee className="size-4" />
        )}
        Confirm Pay at Pickup — ₹{amountInr}
      </button>

      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>
      )}
    </div>
  );
}
