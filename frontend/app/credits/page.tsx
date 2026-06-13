"use client";

import { Leaf } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";
import { GreenCredits } from "@/components/GreenCredits";

export default function CreditsPage() {
 return (
 <RoleGuard allowed={["buyer", "seller", "small_seller", "admin"]}>
 <div className="mx-auto max-w-3xl px-4 py-10">
 <div className="flex items-center gap-2 text-emerald-700 mb-2">
 <Leaf className="size-5" />
 <span className="text-sm font-semibold tracking-wide uppercase">Sustainability</span>
 </div>
 <h1 className="text-3xl font-bold text-slate-900">Your Green Credits</h1>
 <p className="mt-2 text-slate-600 max-w-2xl">
 Earn points for every circular action — pick up locally, give items a second life, donate,
 or avoid a return before it happens.
 </p>
 <div className="mt-8">
 <GreenCredits />
 </div>
 </div>
 </RoleGuard>
 );
}
