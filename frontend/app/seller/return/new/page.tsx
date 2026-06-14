"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCreditToast } from "@/lib/toast";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import { HealthCard, type HealthCardData } from "@/components/HealthCard";
import { RoutingDecision } from "@/components/RoutingDecision";
import {
  Upload,
  Loader2,
  MapPin,
  CheckCircle2,
  Sparkles,
  Package,
} from "lucide-react";

interface Product {
  _id: string;
  title: string;
  category: string;
  brand?: string;
  originalPrice: number;
  images: string[];
  isResellItem?: boolean;
  aiGrade?: string;
  returnId?: string;
}

interface GradeResp {
  grading: {
    grade: "A" | "B" | "C" | "D";
    summary: string;
    defects: string[];
    suggestedPriceMin: number;
    suggestedPriceMax: number;
    confidence: number;
    latencyMs: number;
    provider: string;
  };
  decision: {
    route: string;
    reason: string;
    estimatedRecovery: number;
    logisticsCost: number;
    netRecovery: number;
    platformLoss: number;
  };
  neighbor: {
    buyersNearby: Array<{ _id: string; name: string; distanceKm: number; interests: string[] }>;
    nearestLocker: { _id: string; name: string; address: string; distanceKm: number } | null;
  };
  listing: { _id: string; pickupCode: string; qrDataUrl: string; priceFinal: number } | null;
  healthCard: HealthCardData | null;
  product: Product;
  return: { _id: string; refundAmount: number };
}

export default function NewReturn() {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradeResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showCreditToast } = useCreditToast();

  useEffect(() => {
    api<Product[]>("/products/for-seller").then((p) => {
      setProducts(p);
      if (p[0]) setProductId(p[0]._id);
    }).catch(() => {});
  }, []);

  function onPick(newFiles: FileList) {
    const added = Array.from(newFiles);
    const combined = [...files, ...added].slice(0, 10); // max 10
    setFiles(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
  }

  async function submit() {
    if (files.length < 5) {
      setError("Please upload at least 5 photos of the item");
      return;
    }
    if (!productId) {
      setError("Pick a product");
      return;
    }
    setError(null);
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("productId", productId);
      files.forEach((f) => fd.append("images", f));
      const r = await api<GradeResp>("/returns", { method: "POST", body: fd });
      setResult(r);
      // Show credit toast
      if (r.decision.route === "DONATE") {
        showCreditToast(40, "Donated to an NGO instead of discarding");
      } else if (r.decision.route !== "RECYCLE") {
        showCreditToast(30, "Gave a return a second life instead of landfill");
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading...</div>;
  }
  if (!user) {
    return (
      <div className="p-8">
        <p>Please log in first.</p>
      </div>
    );
  }

  const selected = products.find((p) => p._id === productId);

  return (
    <RoleGuard allowed={["seller", "small_seller", "admin"]}>
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Package className="size-4" />
        Step 1 → AI Grading → Smart Routing → Locker Handoff
      </div>
      <h1 className="mt-2 text-3xl font-bold">New return</h1>
      <p className="text-slate-600">
        Upload a photo. Our AI grades it in under 2 seconds and decides the best route — never blind liquidation.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card p-5">
            <div className="text-sm font-semibold text-slate-700 mb-3">1. Which product?</div>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
            >
              {products.map((p) => (
                <option key={p._id + (p.returnId ?? "")} value={p._id}>
                  {p.isResellItem ? "🔄 " : ""}{p.title} — ₹{p.originalPrice} — {p.category}{p.aiGrade ? ` (Grade ${p.aiGrade})` : ""}
                </option>
              ))}
            </select>
            {selected && (
              <div className="mt-3 text-xs text-slate-500">
                Original price ₹{selected.originalPrice}. Brand {selected.brand}.
                {selected.isResellItem && (
                  <span className="ml-2 text-amber-600 font-medium">⚡ Returned item — ready for resell</span>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-slate-700 mb-1">2. Upload condition photos</div>
            <div className="text-xs text-slate-500 mb-3">Minimum 5 photos required (max 10). Show different angles, defects, labels.</div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && onPick(e.target.files)}
            />
            {previews.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((url, i) => (
                    <div key={i} className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 size-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:bg-brand-50 transition"
                    >
                      <Upload className="size-5" />
                      <span className="text-xs mt-1">Add more</span>
                    </button>
                  )}
                </div>
                <div className={`text-xs font-medium ${files.length >= 5 ? "text-emerald-600" : "text-amber-600"}`}>
                  {files.length}/5 minimum photos {files.length >= 5 ? "✓" : "(need " + (5 - files.length) + " more)"}
                </div>
              </div>
            ) : (
              <button
                className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-brand-400 hover:bg-brand-50 transition"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-8 mb-2" />
                <div className="text-sm">Click to upload (min 5 photos, JPEG/PNG/WEBP, ≤10MB each)</div>
              </button>
            )}
          </div>

          <button
            disabled={submitting || files.length < 5}
            onClick={submit}
            className="btn-primary w-full text-base disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Grading with AI vision...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Grade &amp; route this return
              </>
            )}
          </button>
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>
          )}
        </div>

        <div className="space-y-6">
          {!result ? (
            <div className="card p-8 text-center text-slate-500">
              <Sparkles className="size-8 mx-auto text-brand-300 mb-3" />
              <div className="font-medium text-slate-700">Awaiting AI grading</div>
              <div className="text-sm mt-2">
                Claude vision will return a grade A/B/C/D, condition summary, defects, and a suggested price band — typically in 1–2 seconds.
              </div>
            </div>
          ) : (
            <Result data={result} preview={previews[0] ?? null} />
          )}
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}

function Result({ data, preview }: { data: GradeResp; preview: string | null }) {
  const { grading, decision, neighbor, listing, healthCard } = data;
  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase text-slate-500">AI Grading</div>
            <div className="text-xs text-slate-400">
              {grading.provider} · {grading.latencyMs}ms · {(grading.confidence * 100).toFixed(0)}% confident
            </div>
          </div>
          <GradeBadge grade={grading.grade} size="lg" />
        </div>
        <p className="mt-4 text-slate-700">{grading.summary}</p>
        {grading.defects.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {grading.defects.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-500">•</span>
                {d}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Suggested price band</span>
          <span className="font-semibold text-slate-900">
            ₹{grading.suggestedPriceMin} – ₹{grading.suggestedPriceMax}
          </span>
        </div>
      </div>

      <RoutingDecision
        route={decision.route}
        reason={decision.reason}
        estimatedRecovery={decision.estimatedRecovery}
        logisticsCost={decision.logisticsCost}
        netRecovery={decision.netRecovery}
        platformLoss={decision.platformLoss}
      />

      {decision.route === "NEIGHBOR_FIRST" && neighbor.nearestLocker && (
        <div className="card p-5">
          <div className="font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="size-4 text-brand-600" />
            Drop-off locker
          </div>
          <div className="mt-2">
            <div className="font-medium">{neighbor.nearestLocker.name}</div>
            <div className="text-sm text-slate-600">
              {neighbor.nearestLocker.address} · {neighbor.nearestLocker.distanceKm} km away
            </div>
          </div>
          <div className="mt-4 text-sm">
            <div className="font-semibold text-slate-700 mb-2">
              Verified buyers near you ({neighbor.buyersNearby.length})
            </div>
            <div className="space-y-1.5">
              {neighbor.buyersNearby.slice(0, 5).map((b) => (
                <div key={b._id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium">{b.name}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      interests: {b.interests.join(", ") || "any"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600">{b.distanceKm} km</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {listing && healthCard && (
        <>
          <HealthCard data={healthCard} image={preview ?? undefined} />
          <div className="card p-5 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="size-5" />
              Refund issued: ₹{data.return.refundAmount}
            </div>
            <p className="text-sm text-emerald-700 mt-1">
              You&apos;re never penalized. Refund processed instantly. Listing is live for nearby buyers.
            </p>
            {listing.qrDataUrl && (
              <div className="mt-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.qrDataUrl}
                  alt="Pickup QR"
                  className="size-32 rounded-lg border border-emerald-200 bg-white p-1"
                />
                <div className="text-sm text-emerald-800">
                  <div className="font-semibold">Pickup code</div>
                  <div className="text-2xl font-bold tracking-wider">{listing.pickupCode}</div>
                  <div className="text-xs mt-1">Show this at the locker partner.</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {(decision.route === "DONATE" || decision.route === "RECYCLE") && (
        <div className="card p-5 bg-rose-50 border-rose-200">
          <div className="font-semibold text-rose-700">Routed to {decision.route === "DONATE" ? "NGO partner" : "certified recycler"}</div>
          <p className="text-sm text-rose-700 mt-1">
            Even Grade D items don&apos;t get blindly liquidated. We route them to verified circular partners.
          </p>
          <div className="mt-3 text-sm text-emerald-700 font-medium">
            ✓ Refund of ₹{data.return.refundAmount} issued to you anyway. Sellers are never penalized.
          </div>
        </div>
      )}
    </div>
  );
}
