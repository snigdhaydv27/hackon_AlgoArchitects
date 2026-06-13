"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import Link from "next/link";

interface Ret {
 _id: string;
 aiGrade: "A" | "B" | "C" | "D";
 aiSummary: string;
 route: string;
 estimatedRecovery: number;
 logisticsCost: number;
 status: string;
 refundAmount: number;
 productId: { title: string; originalPrice: number };
 createdAt: string;
}

export default function SellerDashboard() {
 const [list, setList] = useState<Ret[]>([]);

 useEffect(() => {
 api<Ret[]>("/returns").then(setList);
 }, []);

 const totals = list.reduce(
 (a, r) => {
 a.recovery += r.estimatedRecovery ?? 0;
 a.refund += r.refundAmount ?? 0;
 return a;
 },
 { recovery: 0, refund: 0 }
 );

 return (
 <RoleGuard allowed={["seller", "small_seller", "admin"]}>
 <div className="mx-auto max-w-6xl px-4 py-10">
 <div className="flex items-center justify-between flex-wrap gap-3">
 <h1 className="text-3xl font-bold">My returns</h1>
 <Link href="/seller/return/new" className="btn-primary">
 New return
 </Link>
 </div>
 <div className="mt-6 grid sm:grid-cols-3 gap-4">
 <Stat label="Total returns" value={list.length.toString()} />
 <Stat label="Recovery generated" value={`₹${totals.recovery}`} good />
 <Stat label="Refunds received" value={`₹${totals.refund}`} good />
 </div>

 <div className="mt-8 card overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
 <tr>
 <th className="px-4 py-3 text-left">Product</th>
 <th className="px-4 py-3 text-left">Grade</th>
 <th className="px-4 py-3 text-left">Route</th>
 <th className="px-4 py-3 text-right">Recovery</th>
 <th className="px-4 py-3 text-right">Refund</th>
 <th className="px-4 py-3 text-left">Status</th>
 </tr>
 </thead>
 <tbody>
 {list.map((r) => (
 <tr key={r._id} className="border-t border-slate-100">
 <td className="px-4 py-3">
 <div className="font-medium">{r.productId?.title}</div>
 <div className="text-xs text-slate-500 truncate max-w-md">{r.aiSummary}</div>
 </td>
 <td className="px-4 py-3">
 {r.aiGrade && <GradeBadge grade={r.aiGrade} size="sm" />}
 </td>
 <td className="px-4 py-3 text-slate-700">{r.route}</td>
 <td className="px-4 py-3 text-right text-brand-700 font-medium">
 ₹{r.estimatedRecovery}
 </td>
 <td className="px-4 py-3 text-right">₹{r.refundAmount}</td>
 <td className="px-4 py-3">
 <span className="pill bg-slate-100 text-slate-700">{r.status}</span>
 </td>
 </tr>
 ))}
 {list.length === 0 && (
 <tr>
 <td colSpan={6} className="text-center py-10 text-slate-500">
 No returns yet. Start with a new return.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </RoleGuard>
 );
}

function Stat({ label, value, good }: { label: string; value: string; good?: boolean }) {
 return (
 <div className="card p-5">
 <div className="text-xs text-slate-500 uppercase">{label}</div>
 <div className={`text-2xl font-bold ${good ? "text-brand-600" : "text-slate-900"}`}>{value}</div>
 </div>
 );
}

