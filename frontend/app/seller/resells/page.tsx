"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import Link from "next/link";
import {
  RotateCcw,
  Package,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Upload,
  Sparkles,
  MapPin,
  Bell,
  X,
} from "lucide-react";

interface PendingResell {
  _id: string;
  aiSummary: string;
  aiGrade?: string;
  route: string;
  estimatedRecovery: number;
  status: string;
  resellStatus: string;
  images: string[];
  createdAt: string;
  productId: {
    _id: string;
    title: string;
    category: string;
    brand?: string;
    originalPrice: number;
    images?: string[];
  };
}

interface ResellResult {
  ok: boolean;
  message: string;
  grading: {
    grade: string;
    summary: string;
    defects: string[];
    suggestedPriceMin: number;
    suggestedPriceMax: number;
    confidence: number;
    provider: string;
    latencyMs: number;
  };
  decision: {
    route: string;
    reason: string;
    estimatedRecovery: number;
    logisticsCost: number;
  };
  neighbor: {
    buyersNearby: Array<{ _id: string; name: string; distanceKm: number }>;
    nearestLocker: { name: string; address: string; distanceKm: number } | null;
  };
  listing: { _id: string; pickupCode: string; qrDataUrl: string; priceFinal: number } | null;
  healthCard: any;
}

export default function PendingResells() {
  const [list, setList] = useState<PendingResell[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  // Resell-as-returned modal state
  const [resellModal, setResellModal] = useState<PendingResell | null>(null);
  const [resellFiles, setResellFiles] = useState<File[]>([]);
  const [resellPreviews, setResellPreviews] = useState<string[]>([]);
  const [reselling, setReselling] = useState(false);
  const [resellResult, setResellResult] = useState<ResellResult | null>(null);
  const [resellError, setResellError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<PendingResell[]>("/returns/pending-resell")
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  async function markResold(returnId: string) {
    setMarkingId(returnId);
    try {
      await api(`/returns/${returnId}/mark-resold`, { method: "PATCH" });
      setList((prev) => prev.filter((r) => r._id !== returnId));
    } catch (e) {
      alert("Failed: " + String(e));
    } finally {
      setMarkingId(null);
    }
  }

  function openResellModal(item: PendingResell) {
    setResellModal(item);
    setResellFiles([]);
    setResellPreviews([]);
    setResellResult(null);
    setResellError(null);
  }

  function onPickFiles(newFiles: FileList) {
    const added = Array.from(newFiles);
    const combined = [...resellFiles, ...added].slice(0, 10);
    setResellFiles(combined);
    setResellPreviews(combined.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    const updated = resellFiles.filter((_, i) => i !== index);
    setResellFiles(updated);
    setResellPreviews(updated.map((f) => URL.createObjectURL(f)));
  }

  async function submitResellAsReturned() {
    if (!resellModal) return;
    setReselling(true);
    setResellError(null);
    setResellResult(null);
    try {
      const fd = new FormData();
      fd.append("returnId", resellModal._id);
      resellFiles.forEach((f) => fd.append("images", f));
      const r = await api<ResellResult>("/returns/resell-as-returned", {
        method: "POST",
        body: fd,
      });
      setResellResult(r);
      // Remove from list after successful resell
      setList((prev) => prev.filter((item) => item._id !== resellModal._id));
    } catch (e: any) {
      setResellError(e.message || String(e));
    } finally {
      setReselling(false);
    }
  }

  return (
    <RoleGuard allowed={["seller", "small_seller", "admin"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="size-7 text-amber-600" />
              Pending Resells
            </h1>
            <p className="text-slate-600 mt-1">
              Items returned by buyers that are assigned back to you for resale.
            </p>
          </div>
          <Link href="/seller/return/new" className="btn-primary">
            Create Return Listing
          </Link>
        </div>

        {/* Info banner */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <strong>How it works:</strong> Click &quot;Resell as Returned&quot; to auto-grade, assign to a nearby locker, and notify nearby buyers — all in one step. Or click &quot;Resell as New&quot; to go through the full upload flow.
        </div>

        {loading ? (
          <div className="mt-10 text-center text-slate-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="mt-10 text-center py-16">
            <Package className="size-12 text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500 text-lg">No items pending resell</p>
            <p className="text-sm text-slate-400 mt-1">
              When a buyer returns a product you sold, it will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 text-sm text-slate-500">
              {list.length} item{list.length > 1 ? "s" : ""} waiting for you to resell
            </div>

            <div className="mt-6 space-y-3">
              {list.map((r) => (
                <div key={r._id} className="card p-4 flex items-center gap-4 hover:shadow-md transition">
                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {r.productId?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.productId.images[0]}
                        alt={r.productId?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : r.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.images[0]}
                        alt={r.productId?.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="size-6 text-slate-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800 text-sm truncate">
                        {r.productId?.title ?? "Unknown Product"}
                      </h3>
                      <span className="pill bg-amber-100 text-amber-700 text-[10px] shrink-0">
                        Pending Resell
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {r.productId?.category} • {r.productId?.brand ?? "No brand"} • ₹{r.productId?.originalPrice}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 truncate">{r.aiSummary}</p>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-400 shrink-0 hidden sm:block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {/* Resell as Returned — full auto flow */}
                    <button
                      onClick={() => openResellModal(r)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition cursor-pointer"
                      title="Auto-grade, assign to locker, notify buyers"
                    >
                      <RotateCcw className="size-3" />
                      Resell as Returned
                    </button>
                    {/* Resell as New — go to full upload page */}
                    <Link
                      href="/seller/return/new"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                    >
                      <ArrowRight className="size-3" />
                      Resell as New
                    </Link>
                    <button
                      onClick={() => markResold(r._id)}
                      disabled={markingId === r._id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
                    >
                      {markingId === r._id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3" />
                      )}
                      Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ============ Resell as Returned Modal ============ */}
      {resellModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !reselling && setResellModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              {!reselling && (
                <button
                  onClick={() => setResellModal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              )}

              {!resellResult ? (
                <>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <RotateCcw className="size-5 text-amber-600" />
                    Resell as Returned Item
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This will auto-grade the item, assign it to the nearest locker, and notify nearby buyers.
                  </p>

                  {/* Product info */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                      {resellModal.productId?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resellModal.productId.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="size-5 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{resellModal.productId?.title}</p>
                      <p className="text-xs text-slate-500">
                        {resellModal.productId?.category} • ₹{resellModal.productId?.originalPrice}
                      </p>
                    </div>
                  </div>

                  {/* Image upload (optional for resell) */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700">
                      Upload photos (optional — AI will use existing images if skipped)
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && onPickFiles(e.target.files)}
                    />
                    {resellPreviews.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-4 gap-2">
                          {resellPreviews.map((url, i) => (
                            <div key={i} className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeImage(i)}
                                className="absolute top-0.5 right-0.5 size-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {resellPreviews.length < 10 && (
                            <button
                              onClick={() => fileRef.current?.click()}
                              className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-amber-400 hover:bg-amber-50 transition cursor-pointer"
                            >
                              <Upload className="size-4" />
                              <span className="text-[10px] mt-0.5">More</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{resellFiles.length} photo(s) selected</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="mt-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-amber-400 hover:bg-amber-50 transition cursor-pointer"
                      >
                        <Upload className="size-5 mb-1" />
                        <span className="text-xs">Click to upload photos (or skip to use existing)</span>
                      </button>
                    )}
                  </div>

                  {resellError && (
                    <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                      {resellError}
                    </div>
                  )}

                  {/* Submit */}
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => setResellModal(null)}
                      disabled={reselling}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitResellAsReturned}
                      disabled={reselling}
                      className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {reselling ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Grading & Assigning...
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" />
                          Auto-Grade & List
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* ===== SUCCESS RESULT ===== */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="size-6" />
                    <h3 className="text-lg font-bold">Item Listed Successfully!</h3>
                  </div>
                  <p className="text-sm text-slate-600">{resellResult.message}</p>

                  {/* Grading result */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 uppercase">AI Grading</span>
                      {resellResult.grading && (
                        <GradeBadge grade={resellResult.grading.grade as any} size="sm" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mt-2">{resellResult.grading?.summary}</p>
                    <div className="mt-2 text-xs text-slate-500">
                      Provider: {resellResult.grading?.provider} • {resellResult.grading?.latencyMs}ms •{" "}
                      {Math.round((resellResult.grading?.confidence ?? 0) * 100)}% confident
                    </div>
                  </div>

                  {/* Locker assignment */}
                  {resellResult.neighbor?.nearestLocker && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
                        <MapPin className="size-4" />
                        Assigned to: {resellResult.neighbor.nearestLocker.name}
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">
                        {resellResult.neighbor.nearestLocker.address} •{" "}
                        {resellResult.neighbor.nearestLocker.distanceKm} km away
                      </p>
                    </div>
                  )}

                  {/* Buyers notified */}
                  {resellResult.neighbor?.buyersNearby && resellResult.neighbor.buyersNearby.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
                        <Bell className="size-4" />
                        {resellResult.neighbor.buyersNearby.length} nearby buyer(s) notified
                      </div>
                    </div>
                  )}

                  {/* Listing details */}
                  {resellResult.listing && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-sm font-medium text-amber-800">
                        Listed at ₹{resellResult.listing.priceFinal}
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        Pickup Code: <span className="font-bold tracking-wider">{resellResult.listing.pickupCode}</span>
                      </div>
                      {resellResult.listing.qrDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resellResult.listing.qrDataUrl}
                          alt="QR"
                          className="mt-2 w-24 h-24 rounded border border-amber-200 bg-white p-1"
                        />
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setResellModal(null)}
                    className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded-lg transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </RoleGuard>
  );
}
