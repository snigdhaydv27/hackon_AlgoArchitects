"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { GradeBadge } from "@/components/GradeBadge";
import { TrendingUp, Package, Users, Recycle as RecycleIcon } from "lucide-react";

interface Stats {
  totalReturns: number;
  byRoute: Record<string, number>;
  recoveryByRoute: Record<string, number>;
  totalRecovery: number;
  totalLogistics: number;
  netRecovery: number;
  liquidationBaseline: number;
  neighborFirstRate: number;
  liveListings: number;
  completedListings: number;
  productsCatalogued: number;
  preventionStats: number;
}

interface Ret {
  _id: string;
  aiGrade: string;
  route: string;
  estimatedRecovery: number;
  refundAmount: number;
  productId: { title: string };
  sellerId: { name: string };
  status: string;
  createdAt: string;
}

const COLORS = ["#1eb877", "#0ea5e9", "#f59e0b", "#ec4899", "#64748b"];

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [returns, setReturns] = useState<Ret[]>([]);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats);
    api<Ret[]>("/admin/returns").then(setReturns);
  }, []);

  if (!stats) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

  const routeData = Object.entries(stats.byRoute).map(([name, value]) => ({ name, value }));
  const recoveryData = Object.entries(stats.recoveryByRoute).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">ReLoop Operations</h1>
      <p className="text-slate-600">
        Real-time picture of recovery economics, route distribution, and Neighbor First impact.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<TrendingUp className="size-5 text-brand-600" />}
          label="Net recovery"
          value={`₹${stats.netRecovery.toLocaleString()}`}
          caption="vs ₹0 in old liquidation flow"
          good
        />
        <Stat
          icon={<Users className="size-5 text-brand-600" />}
          label="Neighbor First rate"
          value={`${Math.round(stats.neighborFirstRate * 100)}%`}
          caption="returns matched to local buyers"
          good
        />
        <Stat
          icon={<Package className="size-5 text-brand-600" />}
          label="Live listings"
          value={stats.liveListings.toString()}
          caption={`${stats.completedListings} completed`}
        />
        <Stat
          icon={<RecycleIcon className="size-5 text-brand-600" />}
          label="Total returns processed"
          value={stats.totalReturns.toString()}
          caption={`${stats.productsCatalogued} products catalogued`}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <div className="font-semibold mb-3">Route distribution</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={routeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {routeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="font-semibold mb-3">Recovery (₹) by route</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1eb877" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 font-semibold">Recent returns</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Seller</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-right">Recovery</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.slice(0, 12).map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{r.productId?.title}</td>
                <td className="px-4 py-3 text-slate-600">{r.sellerId?.name}</td>
                <td className="px-4 py-3">
                  {r.aiGrade && <GradeBadge grade={r.aiGrade as "A"} size="sm" />}
                </td>
                <td className="px-4 py-3 text-slate-700">{r.route}</td>
                <td className="px-4 py-3 text-right text-brand-700 font-medium">
                  ₹{r.estimatedRecovery}
                </td>
                <td className="px-4 py-3">
                  <span className="pill bg-slate-100 text-slate-700">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  caption,
  good,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
  good?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-slate-500 text-xs uppercase">
        {icon}
        {label}
      </div>
      <div className={"mt-2 text-2xl font-bold " + (good ? "text-brand-700" : "text-slate-900")}>
        {value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{caption}</div>
    </div>
  );
}
