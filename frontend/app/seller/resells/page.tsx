"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import Link from "next/link";
import { RotateCcw, Package, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface PendingResell {
  _id: string;
  aiSummary: string;
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

export default function PendingResells() {
  const [list, setList] = useState<PendingResell[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

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
                    <Link
                      href="/seller/return/new"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                    >
                      <ArrowRight className="size-3" />
                      Resell
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
    </RoleGuard>
  );
}
