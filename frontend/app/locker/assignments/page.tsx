"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import { Package, CheckCircle2, Filter, Loader2 } from "lucide-react";

interface Assignment {
  _id: string;
  title: string;
  grade: "A" | "B" | "C" | "D";
  priceFinal: number;
  summary?: string;
  images: string[];
  status: string;
  pickupCode?: string;
  createdAt: string;
  productId?: {
    title: string;
    category: string;
    brand?: string;
    originalPrice: number;
    images?: string[];
  };
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "RESERVED", label: "Reserved" },
  { value: "PAID", label: "Paid" },
  { value: "COMPLETE", label: "Completed" },
];

export default function LockerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function fetchAssignments(status: string) {
    setLoading(true);
    api<Assignment[]>(`/lockers/my-assignments?status=${status}`)
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchAssignments(filter);
  }, [filter]);

  async function confirmHandoff(listingId: string) {
    setConfirmingId(listingId);
    try {
      await api(`/lockers/assignments/${listingId}/confirm-handoff`, { method: "PATCH" });
      // Refresh list
      fetchAssignments(filter);
    } catch (e) {
      alert("Failed to confirm handoff: " + String(e));
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <RoleGuard allowed={["locker"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="size-7 text-emerald-600" />
            Assigned Items
          </h1>
        </div>

        <p className="text-slate-600 mt-2">
          Items from returned products that have been assigned to your locker for local handoff.
        </p>

        {/* Filter Tabs */}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-slate-400" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer border ${
                filter === f.value
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Assignments Table */}
        {loading ? (
          <div className="mt-8 text-center text-slate-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="mt-8 text-center py-16">
            <Package className="size-12 text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500">No assignments found{filter !== "all" ? ` with status "${filter}"` : ""}.</p>
          </div>
        ) : (
          <div className="mt-6 card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Grade</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Pickup Code</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {a.images?.[0] && (
                          <img
                            src={a.images[0]}
                            alt={a.title}
                            className="size-10 rounded-lg object-cover border border-slate-200"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-800">{a.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-xs">
                            {a.summary || a.productId?.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <GradeBadge grade={a.grade} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                      ₹{a.priceFinal}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      {a.pickupCode ? (
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                          {a.pickupCode}
                        </code>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(a.status === "PAID" || a.status === "RESERVED") && (
                        <button
                          onClick={() => confirmHandoff(a._id)}
                          disabled={confirmingId === a._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          {confirmingId === a._id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3" />
                          )}
                          Confirm Handoff
                        </button>
                      )}
                      {a.status === "COMPLETE" && (
                        <span className="text-xs text-emerald-600 font-medium">✓ Done</span>
                      )}
                      {a.status === "LIVE" && (
                        <span className="text-xs text-amber-600 font-medium">Awaiting buyer</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LIVE: "bg-amber-100 text-amber-700",
    RESERVED: "bg-blue-100 text-blue-700",
    PAID: "bg-purple-100 text-purple-700",
    COMPLETE: "bg-emerald-100 text-emerald-700",
    EXPIRED: "bg-slate-100 text-slate-500",
    DROPPED: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`pill ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
