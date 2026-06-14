"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
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
import {
  TrendingUp,
  Package,
  Users,
  Recycle as RecycleIcon,
  Webhook,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

interface Persona { id: string; name: string; role: string; }
interface Product { _id: string; title: string; }

const COLORS = ["#1eb877", "#0ea5e9", "#f59e0b", "#ec4899", "#64748b"];

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [returns, setReturns] = useState<Ret[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<Persona[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  async function refresh() {
    const [s, r, o] = await Promise.all([
      api<Stats>("/admin/stats"),
      api<Ret[]>("/admin/returns"),
      api<any[]>("/admin/orders"),
    ]);
    setStats(s);
    setReturns(r);
    setOrders(o);
  }

  useEffect(() => {
    refresh();
    api<Persona[]>("/auth/personas").then((all) =>
      setSellers(all.filter((p) => p.role === "seller" || p.role === "small_seller"))
    );
    api<Product[]>("/products").then(setProducts);
  }, []);

  async function simulate() {
    setSimulating(true);
    setSimResult(null);
    try {
      // Pick a random seller + random product to simulate a return webhook from parent platform
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      if (!seller || !product) {
        setSimResult("No sellers/products available — re-seed the database.");
        return;
      }
      const r = await api<{ message: string; notifiedBuyers: number; decision: { route: string } }>(
        "/webhooks/return-initiated",
        {
          method: "POST",
          body: JSON.stringify({ sellerId: seller.id, productId: product._id }),
        },
      );
      setSimResult(
        `${seller.name} → ${product.title} → ${r.decision.route} · ${r.notifiedBuyers} buyers notified`
      );
      await refresh();
    } catch (e) {
      setSimResult("Error: " + String(e));
    } finally {
      setSimulating(false);
    }
  }

  if (authLoading || !user || user.role !== "admin") {
    return <div className="p-8 text-slate-500">Loading...</div>;
  }

  if (!stats) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

  const routeData = Object.entries(stats.byRoute).map(([name, value]) => ({ name, value }));
  const recoveryData = Object.entries(stats.recoveryByRoute).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Amazon Operations</h1>
          <p className="text-slate-600">
            Real-time picture of recovery economics, route distribution, and Neighbor First impact.
          </p>
        </div>
        <div className="card p-4 max-w-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Webhook className="size-4 text-brand-600" />
            Parent platform webhook simulator
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fires <code>POST /api/webhooks/return-initiated</code> as if Flipkart/Amazon initiated a return — fully automated pipeline runs.
          </p>
          <button
            onClick={simulate}
            disabled={simulating}
            className="btn-primary text-sm mt-3 w-full"
          >
            {simulating ? <Loader2 className="size-4 animate-spin" /> : <Webhook className="size-4" />}
            Simulate return webhook
          </button>
          {simResult && (
            <div className="mt-3 text-xs flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded p-2 text-emerald-700">
              <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
              <span>{simResult}</span>
            </div>
          )}
        </div>
      </div>

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
                <Pie data={routeData} dataKey="value" nameKey="name" outerRadius={80} label>
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

      <div className="mt-8 card overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 font-semibold">Recent Shop Orders</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Buyer</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-right">Total Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 12).map((o) => (
              <tr key={o._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-xs">{o._id}</td>
                <td className="px-4 py-3 text-slate-600">{o.userId?.name}</td>
                <td className="px-4 py-3 text-slate-700">{o.items.length} item(s)</td>
                <td className="px-4 py-3 text-right font-medium">₹{o.totalAmount}</td>
                <td className="px-4 py-3">
                  <span className={`pill text-xs ${o.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No orders found.</td>
              </tr>
            )}
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
