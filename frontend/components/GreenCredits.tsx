"use client";

import { useEffect, useState } from "react";
import { Leaf, Sparkles, Heart, Users, ShieldCheck, Package } from "lucide-react";
import { api } from "@/lib/api";

interface CreditHistory {
 amount: number;
 reason: string;
 description: string;
 createdAt: string;
}

interface CreditSummary {
 balance: number;
 history: CreditHistory[];
}

const REASON_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
 LOCAL_PICKUP: Users,
 RETURN_DIVERTED: Package,
 DONATION: Heart,
 RETURN_PREVENTED: ShieldCheck,
};

export function GreenCredits() {
 const [data, setData] = useState<CreditSummary | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 api<CreditSummary>("/credits/me")
 .then(setData)
 .catch(() => setData(null))
 .finally(() => setLoading(false));
 }, []);

 if (loading) return <div className="card p-6 text-slate-500">Loading your green credits...</div>;
 if (!data) return null;

 return (
 <div className="space-y-5">
 {/* Balance */}
 <div className="card p-6 bg-gradient-to-br from-emerald-50 to-white">
 <div className="flex items-center gap-2 text-emerald-700">
 <Leaf className="size-5" />
 <span className="text-sm font-semibold">Green Credits</span>
 </div>
 <div className="mt-2 text-5xl font-black text-emerald-700">{data.balance}</div>
 <div className="text-xs text-slate-500 mt-1">Points earned for circular actions</div>
 </div>

 {/* History */}
 <div className="card p-5">
 <div className="flex items-center gap-2 text-slate-900 font-semibold mb-4">
 <Sparkles className="size-4 text-emerald-600" />
 How you earned them
 </div>
 {data.history.length === 0 ? (
 <p className="text-sm text-slate-500">
 No credits yet. Pick up locally, donate, or heed a prevention alert to start earning.
 </p>
 ) : (
 <ul className="divide-y divide-slate-100">
 {data.history.map((h, i) => {
 const Icon = REASON_ICON[h.reason] ?? Sparkles;
 return (
 <li key={i} className="flex items-center gap-3 py-3">
 <Icon className="size-4 text-emerald-600" />
 <div className="flex-1">
 <div className="text-sm text-slate-800">{h.description}</div>
 <div className="text-xs text-slate-400">
 {new Date(h.createdAt).toLocaleDateString()}
 </div>
 </div>
 <div className="text-sm font-bold text-emerald-600">+{h.amount}</div>
 </li>
 );
 })}
 </ul>
 )}
 </div>
 </div>
 );
}
