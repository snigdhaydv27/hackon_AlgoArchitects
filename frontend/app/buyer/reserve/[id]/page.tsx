"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RoleGuard } from "@/components/RoleGuard";
import { HealthCard, type HealthCardData } from "@/components/HealthCard";
import { RazorpayButton } from "@/components/RazorpayButton";
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

  useEffect(() => {
    if (!params.id) return;
    api<ListingResp>(`/listings/${params.id}`).then(setData).catch((e) => setError(String(e)));
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
      <div className="p-8 text-slate-500 flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </div>
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
              {listing.lockerId?.partnerType} · open {listing.lockerId?.hours ?? "8 AM – 10 PM"}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs uppercase text-slate-500">Listing status</div>
          <div className="text-2xl font-bold text-slate-900">{status}</div>
          <p className="text-sm text-slate-600 mt-1">
            Amazon holds your payment until pickup is confirmed at the locker.
          </p>
          {error && (
            <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="mt-4 grid gap-3">
            <Step
              label="Reserve item"
              done={status !== "LIVE"}
              active={status === "LIVE"}
              onClick={() => action("reserve")}
              loading={working === "reserve"}
            />

            {(status === "RESERVED" || status === "DROPPED") && user && (
              <RazorpayButton
                listingId={listing._id}
                amountInr={listing.priceFinal}
                buyerName={user.name}
                onPaid={onPaid}
              />
            )}

            {(status === "PAID" || status === "COMPLETE") && (
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="size-4" />
                <span className="text-sm">Payment received</span>
              </div>
            )}

            <Step
              label="Pick up at locker"
              done={status === "COMPLETE"}
              active={status === "PAID"}
              onClick={() => action("pickup")}
              loading={working === "pickup"}
            />
          </div>
        </div>

        {status !== "LIVE" && (
          <div className="card p-5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <QrCode className="size-4 text-brand-600" />
              Your pickup QR
            </div>
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
                <div className="text-xs text-slate-500 mt-1">Show at the locker partner.</div>
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
              Seller has been refunded fully. Amazon recovered ₹{listing.priceFinal} that would
              have been ₹0 in the old liquidation flow.
            </p>
            <button onClick={() => router.push("/buyer/nearby")} className="btn-secondary mt-4 text-sm">
              Browse more
            </button>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}

function Step({
  label,
  done,
  active,
  onClick,
  loading,
}: {
  label: string;
  done: boolean;
  active: boolean;
  onClick: () => void;
  loading: boolean;
}) {
  if (done) {
    return (
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="size-4" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  if (!active) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <span className="size-4 rounded-full border border-slate-300" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  return (
    <button onClick={onClick} disabled={loading} className="btn-primary w-full justify-start text-sm">
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {label}
    </button>
  );
}
