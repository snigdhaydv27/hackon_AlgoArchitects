import Link from "next/link";
import {
 Brain,
 Route,
 ShieldCheck,
 AlertTriangle,
 Users,
 ArrowRight,
 Recycle,
} from "lucide-react";

const PILLARS = [
 {
 icon: Brain,
 title: "AI Grading",
 desc: "Upload a photo. Claude vision grades A/B/C/D, lists defects, sets a price band — in under 2 seconds. No manual inspection.",
 },
 {
 icon: Route,
 title: "Smart Routing",
 desc: "Recovery value vs logistics cost decides the path: Neighbor First, Renewed, Refurbish, Donate, Recycle. Never blind liquidation.",
 },
 {
 icon: ShieldCheck,
 title: "Trust Layer",
 desc: "Product Health Card with AI summary, platform badge, fixed price, locker pickup. No haggling. No strangers. No doorstep visits.",
 },
 {
 icon: AlertTriangle,
 title: "Prevention",
 desc: "Pre-purchase AI warning. \"847 customers with your foot profile prefer Size 8.\" Stop the return before it happens.",
 },
 {
 icon: Users,
 title: "Neighbor First",
 desc: "₹500 shoes? Find a verified buyer ≤ 20 km. Drop at a kirana locker. Buyer picks up via QR. Zero logistics. Zero risk.",
 },
];

const PERSONAS = [
 {
 name: "Priya",
 line: "Returned ₹500 shoes. 600 km warehouse trip costs more than the shoe. Today: liquidated. With ReLoop: buyer 8km away.",
 },
 {
 name: "Rahul",
 line: "Working baby monitor in a drawer. Won't sell on classifieds. With ReLoop: 50 nearby parents notified, locker handoff, no haggling.",
 },
 {
 name: "Small Seller",
 line: "200 returns/month marked \"didn't match.\" Manual inspection, guesswork. With ReLoop: AI grades + auto-routes, all in seconds.",
 },
];

export default function Home() {
 return (
 <div className="gradient-bg">
 <section className="mx-auto max-w-6xl px-4 pt-16 pb-20">
 <div className="flex items-center gap-2 text-[#c45500] mb-6">
 <Recycle className="size-5 text-[#ff9900]" />
 <span className="text-sm font-semibold tracking-wide uppercase">
 Circular Commerce, Reimagined
 </span>
 </div>
 <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight text-slate-900">
 Every returned, unused, or outgrown product
 <span className="block text-[#c45500]">finds its next best owner.</span>
 </h1>
 <p className="mt-6 max-w-2xl text-lg text-slate-600">
 The system works for premium. For the long tail — ₹200 to ₹800 — it breaks.
 ReLoop fixes that with AI grading, smart routing, and hyperlocal locker handoffs.
 </p>
 <div className="mt-8 flex gap-3 flex-wrap">
 <Link href="/login" className="btn-primary">
 Try the demo
 <ArrowRight className="size-4" />
 </Link>
 <Link href="/admin" className="btn-secondary">
 View economics dashboard
 </Link>
 </div>

 <div className="mt-16 grid gap-4 md:grid-cols-3">
 {PERSONAS.map((p) => (
 <div key={p.name} className="card p-5">
 <h3 className="font-semibold text-slate-900">{p.name}</h3>
 <p className="text-sm text-slate-600 mt-2">{p.line}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="bg-white border-t border-slate-200">
 <div className="mx-auto max-w-6xl px-4 py-20">
 <h2 className="text-3xl font-bold text-slate-900">The 5 pillars</h2>
 <p className="mt-2 text-slate-600">Each pillar removes one piece of the broken long-tail loop.</p>
 <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
 {PILLARS.map((p, i) => (
 <div key={p.title} className="card p-6">
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-[#ffd814]/15 p-2 text-[#b12704]">
 <p.icon className="size-5" />
 </div>
 <div className="text-xs font-semibold text-slate-400">
 Pillar {String(i + 1).padStart(2, "0")}
 </div>
 </div>
 <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
 <p className="mt-2 text-sm text-slate-600">{p.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="mx-auto max-w-6xl px-4 py-20">
 <div className="card p-8 bg-gradient-to-br from-[#ffd814]/10 to-white">
 <h2 className="text-2xl font-bold text-slate-900">The economics</h2>
 <div className="mt-6 grid sm:grid-cols-3 gap-6">
 <Stat label="Liquidation today" value="₹0" caption="100% loss on long-tail returns" tone="bad" />
 <Stat label="ReLoop recovery" value="₹350+" caption="Average net value reclaimed per return" tone="good" />
 <Stat label="Logistics saved" value="100%" caption="Neighbor First skips the warehouse" tone="good" />
 </div>
 </div>
 </section>
 </div>
 );
}

function Stat({
 label,
 value,
 caption,
 tone,
}: {
 label: string;
 value: string;
 caption: string;
 tone: "good" | "bad";
}) {
 return (
 <div>
 <div className="text-sm text-slate-500">{label}</div>
 <div
 className={
 "text-4xl font-bold " + (tone === "good" ? "text-[#b12704]" : "text-rose-600")
 }
 >
 {value}
 </div>
 <div className="text-xs text-slate-500 mt-1">{caption}</div>
 </div>
 );
}

