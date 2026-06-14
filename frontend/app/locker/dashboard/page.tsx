"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import Link from "next/link";
import { Package, TrendingUp, Leaf, Archive, MapPin, Clock } from "lucide-react";

interface LockerStats {
  locker: {
    name: string;
    address: string;
    capacity: number;
    occupied: number;
  };
  stats: {
    totalAssigned: number;
    liveCount: number;
    completedCount: number;
    creditsEarned: number;
  };
  creditHistory: Array<{
    amount: number;
    reason: string;
    description: string;
    createdAt: string;
  }>;
}

export default function LockerDashboard() {
  const [data, setData] = useState<LockerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<LockerStats>("/lockers/my-stats")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <RoleGuard allowed={["locker"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Locker Partner Dashboard</h1>
            {data && (
              <p className="text-slate-600 mt-1 flex items-center gap-1.5">
                <MapPin className="size-4 text-emerald-600" />
                {data.locker.name} — {data.locker.address}
              </p>
            )}
          </div>
          <Link href="/locker/assignments" className="btn-primary">
            View All Assignments
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 text-center text-slate-500">Loading dashboard...</div>
        ) : !data ? (
          <div className="mt-10 text-center text-slate-500">
            No locker linked to your account. Please contact support.
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Package className="size-5 text-blue-600" />}
                label="Total Assigned"
                value={data.stats.totalAssigned.toString()}
                bg="bg-blue-50"
              />
              <StatCard
                icon={<Archive className="size-5 text-amber-600" />}
                label="Currently Live"
                value={data.stats.liveCount.toString()}
                bg="bg-amber-50"
              />
              <StatCard
                icon={<TrendingUp className="size-5 text-emerald-600" />}
                label="Completed Handoffs"
                value={data.stats.completedCount.toString()}
                bg="bg-emerald-50"
              />
              <StatCard
                icon={<Leaf className="size-5 text-green-600" />}
                label="Green Credits"
                value={data.stats.creditsEarned.toString()}
                bg="bg-green-50"
              />
            </div>

            {/* Capacity Indicator */}
            <div className="mt-6 card">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Clock className="size-4 text-slate-500" />
                Locker Capacity
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.locker.occupied / data.locker.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {data.locker.occupied} / {data.locker.capacity} slots used
                </span>
              </div>
            </div>

            {/* Recent Credit Activity */}
            <div className="mt-6 card">
              <h3 className="font-semibold text-slate-800 mb-4">Recent Credit Activity</h3>
              {data.creditHistory.length === 0 ? (
                <p className="text-sm text-slate-500">No credits earned yet. Items assigned to your locker will earn you green credits.</p>
              ) : (
                <div className="space-y-3">
                  {data.creditHistory.slice(0, 10).map((credit, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{credit.description}</p>
                        <p className="text-xs text-slate-500">{new Date(credit.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="pill bg-emerald-100 text-emerald-700">+{credit.amount} credits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
