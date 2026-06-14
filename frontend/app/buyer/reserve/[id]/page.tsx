"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RoleGuard } from "@/components/RoleGuard";
import { HealthCard, type HealthCardData } from "@/components/HealthCard";
import { RazorpayButton } from "@/components/RazorpayButton";
import { PayAtPickup } from "@/components/PayAtPickup";
import { MapPin, CheckCircle2, Loader2, QrCode } from "lucide-react";

interface ListingResp {
  listing: {
    _id: string;
    title: string;
    grade: "A" | "B" | "C" | "D";
    summary: string;
    images: string[];
    priceFinal: number;
    pickupCode: string;
    qrDataUrl: string;
    status: string;
    lockerId: {
      _id: string;
      name: string;
      address: string;
      hours?: string;
      partnerType?: string;
    };
    productId: { title: string; originalPrice: number };
  };
  healthCard: HealthCardData;
}

export default function Reserve() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<ListingResp | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ hasRazorpay: boolean; payAtPickupAvailable: boolean } | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api<ListingResp>(`/listings/${params.id}`).then(setData).catch((e) => setError(String(e)));
    // Check payment availability for this listing
    api<{ hasRazorpay: boolean; payAtPickupAvailable: boolean }>(`/payment/status/${params.id}`)
      .then(setPaymentInfo)
      .catch(() => setPaymentInfo({ hasRazorpay: false, payAtPickupAvailable: true }));
  }, [params.id]);

  async function action(verb: "reserve" | "pickup") {
    if (!data) return;
    setWorking(verb);
    setError(null);
    try {
      const body = verb === "pickup" ? { code: data.listing.pickupCode } : undefined;
      await api(`/listings/${data.listing._id}/${verb}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      const fresh = await api<ListingResp>(`/listings/${data.listing._id}`);
      setData(fresh);
    } catch (e) {
      setError(String(e));
    } finally {
      setWorking(null);
    }
  }

  async function onPaid() {
    if (!data) return;
    const fresh = await api<ListingResp>(`/listings/${data.listing._id}`);
    setData(fresh);
  }

  if (!data) {
    return (
      <RoleGuard allowed={["buyer", "admin"]}>
        <div className="p-8 text-slate-500 flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </div>
      </RoleGuard>
    );
  }

  const { listing, healthCard } = data;
  const status = listing.status;

  return (
    <RoleGuard allowed={["buyer", "admin"]}>
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-6 lg:grid-cols-2">
      <HealthCard data={healthCard} images={listing.images} />

      <div className="space-y-5">
        <div className="card p-5">
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="size-4 text-brand-600" />
            Pickup locker
          </div>
          <div className="mt-2">
            <div className="font-medium">{listing.lockerId?.name}</div>
            <div className="text-sm text-slate-600">{listing.lockerId?.address}</div>
            <div className="text-xs text-slate-500 mt-1">
              Self-service smart locker · open {listing.lockerId?.hours ?? "24/7"}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500">Order status</div>
          <div className="text-2xl font-bold text-slate-900">{statusLabel(status)}</div>
          <p className="text-sm text-slate-600 mt-1">
            {status === "LIVE" && "This item is available. Reserve it to hold it for you."}
            {status === "RESERVED" && "Item is reserved for you. Complete payment to proceed."}
            {status === "PAID" && "Payment confirmed. Visit the locker and enter your pickup code to unlock and collect your item."}
            {status === "COMPLETE" && "You've picked up this item. Enjoy!"}
          </p>
          {error && (
            <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="mt-4 grid gap-3">
            {/* Step 1: Reserve */}
            <StepIndicator
              label="1. Reserve item"
              done={status !== "LIVE"}
              active={status === "LIVE"}
            />
            {status === "LIVE" && (
              <button
                onClick={() => action("reserve")}
                disabled={working === "reserve"}
                className="btn-primary w-full justify-start text-sm"
              >
                {working === "reserve" ? <Loader2 className="size-4 animate-spin" /> : null}
                Reserve this item
              </button>
            )}

            {/* Step 2: Pay */}
            <StepIndicator
              label="2. Pay"
              done={status === "PAID" || status === "COMPLETE"}
              active={status === "RESERVED" || status === "DROPPED"}
            />
            {(status === "RESERVED" || status === "DROPPED") && user && (
              <>
                {paymentInfo?.hasRazorpay ? (
                  <RazorpayButton
                    listingId={listing._id}
                    amountInr={listing.priceFinal}
                    buyerName={user.name}
                    onPaid={onPaid}
                  />
                ) : (
                  <PayAtPickup
                    listingId={listing._id}
                    amountInr={listing.priceFinal}
                    lockerName={listing.lockerId?.name}
                    onPaid={onPaid}
                  />
                )}
              </>
            )}

            {/* Step 3: Pick up */}
            <StepIndicator
              label="3. Pick up from locker"
              done={status === "COMPLETE"}
              active={status === "PAID"}
            />
            {status === "PAID" && (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <p className="font-medium">Collect your item from the smart locker:</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>📍 Go to <strong>{listing.lockerId?.name}</strong> ({listing.lockerId?.address})</li>
                    <li>🔑 Enter your pickup code on the locker screen to unlock</li>
                    <li>📦 Take your item and confirm collection below</li>
                  </ul>
                </div>
                <button
                  onClick={() => action("pickup")}
                  disabled={working === "pickup"}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {working === "pickup" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  I&apos;ve collected my item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR Code section — shown after reservation */}
        {status !== "LIVE" && (
          <div className="card p-5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <QrCode className="size-4 text-brand-600" />
              Your pickup code
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enter this code on the locker screen at {listing.lockerId?.name} to unlock and collect your item.
            </p>
            <div className="mt-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.qrDataUrl}
                alt="QR"
                className="size-32 rounded-lg border border-slate-200 bg-white p-1"
              />
              <div>
                <div className="text-xs text-slate-500">Pickup code</div>
                <div className="text-2xl font-bold tracking-wider text-slate-900">
                  {listing.pickupCode}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Enter this on the locker screen to unlock your compartment.
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "COMPLETE" && (
          <div className="card p-5 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="size-5" />
              Pickup complete
            </div>
            <p className="text-sm text-emerald-700 mt-1">
              Item collected successfully. The seller has been paid ₹{listing.priceFinal}.
              This item was saved from landfill and found its next best owner — you!
            </p>
            <button onClick={() => router.push("/buyer/nearby")} className="btn-secondary mt-4 text-sm">
              Browse more items
            </button>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "LIVE": return "Available";
    case "RESERVED": return "Reserved for you";
    case "DROPPED": return "Ready for payment";
    case "PAID": return "Paid — Ready for pickup";
    case "COMPLETE": return "Picked up ✓";
    default: return status;
  }
}

function StepIndicator({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  if (done) {
    return (
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="size-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  }
  if (active) {
    return (
      <div className="flex items-center gap-2 text-slate-900">
        <span className="size-4 rounded-full bg-brand-500 border-2 border-brand-300 animate-pulse" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <span className="size-4 rounded-full border border-slate-300" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

