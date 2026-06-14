import Link from "next/link";
import {
  Brain,
  Route,
  ShieldCheck,
  AlertTriangle,
  Users,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";

const PILLARS = [
  {
    icon: Brain,
    title: "AI Grading in Seconds",
    desc: "Upload a photo. Our vision AI instantly grades A/B/C/D, lists defects, and sets a price band. Zero manual inspection required.",
  },
  {
    icon: Route,
    title: "Smart Auto-Routing",
    desc: "Recovery value vs logistics cost automatically determines the best path: Neighbor First, Renewed, Refurbish, Donate, or Recycle.",
  },
  {
    icon: ShieldCheck,
    title: "Immutable Trust Layer",
    desc: "Every item gets a Product Health Card with an AI summary, fixed pricing, and verified locker pickup. No haggling. No strangers.",
  },
  {
    icon: AlertTriangle,
    title: "Proactive Prevention",
    desc: "Stop returns before they happen. Pre-purchase AI warnings alert buyers if an item is frequently returned for fit or quality.",
  },
  {
    icon: Users,
    title: "Neighbor First Hubs",
    desc: "Connect verified local buyers within a 20km radius. Drop at a secure kirana locker, buyer picks up via QR. Zero logistics overhead.",
  },
];

const PERSONAS = [
  {
    name: "Priya",
    role: "Frustrated Buyer",
    problem: "Returned ₹500 shoes. A 600km warehouse trip costs more than the item itself. Result: liquidation.",
    solution: "With Amazon: Found a buyer 8km away. Re-homed in 2 hours."
  },
  {
    name: "Rahul",
    role: "Busy Parent",
    problem: "Working baby monitor sitting in a drawer. Doesn't want the hassle of online classifieds.",
    solution: "With Amazon: 50 nearby parents notified instantly. Secure locker handoff."
  },
  {
    name: "Small Seller",
    role: "Drowning in Returns",
    problem: "200 returns/month marked 'didn't match'. Relying on manual inspection and guesswork.",
    solution: "With Amazon: AI grades & auto-routes the entire batch in seconds."
  },
];

export default function Home() {
  return (
    <div className="bg-[#EAEDED] font-sans text-[#0F1111] pb-12">
      
      {/* Hero Section - Amazon Style Carousel/Banner Substitute */}
      <section className="bg-white border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 md:py-12 flex flex-col items-center text-center">
          
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-[#0F1111]">
            Every return finds its next best owner.
          </h1>
          
          <p className="max-w-3xl text-lg text-[#565959] mb-8">
            The system works for premium goods. For the long tail — ₹200 to ₹800 — it breaks. <br/>
            <span className="font-bold text-[#0F1111]">Amazon fixes this with AI grading, smart routing, and hyperlocal locker networks.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-semibold text-lg px-8 py-3 rounded-full flex items-center justify-center transition-colors">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>
        </div>
      </section>

      {/* Main Content Area - Grid of Cards */}
      <div className="mx-auto max-w-[1500px] px-4 mt-6">
        
        {/* Personas Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-[#0F1111]">Real problems. Real solutions.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PERSONAS.map((p, i) => (
              <div key={p.name} className="bg-white p-5 rounded-md border border-[#D5D9D9] shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#565959]">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0F1111] leading-none">{p.name}</h3>
                    <span className="text-xs font-semibold text-[#007185] uppercase tracking-wider">{p.role}</span>
                  </div>
                </div>
                
                <div className="flex-grow space-y-3">
                  <div>
                    <span className="font-bold text-[#B12704] text-sm block">The Problem:</span>
                    <p className="text-sm text-[#0F1111]">{p.problem}</p>
                  </div>
                  <div>
                    <span className="font-bold text-[#007185] text-sm block">The Fix:</span>
                    <p className="text-sm text-[#0F1111]">{p.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The 5 Pillars Section */}
        <div className="mb-6 bg-white p-6 rounded-md border border-[#D5D9D9] shadow-sm">
          <div className="mb-6 border-b border-[#D5D9D9] pb-4">
            <h2 className="text-2xl font-bold text-[#0F1111]">The Five Pillars of Amazon</h2>
            <p className="text-sm text-[#565959] mt-1">Each pillar removes a critical bottleneck from the broken long-tail return loop.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 gap-y-6">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#EBF8F4] flex items-center justify-center text-[#007185]">
                    <p.icon className="size-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F1111] mb-1">{p.title}</h3>
                  <p className="text-sm text-[#565959] leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economics Dashboard Snapshot */}
        <div className="bg-white rounded-md border border-[#D5D9D9] shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 md:w-1/3 bg-[#F8F9FA] border-b md:border-b-0 md:border-r border-[#D5D9D9] flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0F1111] mb-2">The Unit Economics</h2>
            <p className="text-sm text-[#565959]">Turning a 100% loss into a profitable, sustainable operation for every stakeholder in the chain.</p>
          </div>
          
          <div className="p-8 md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D5D9D9]">
            <Stat label="Liquidation Today" value="₹0" caption="100% loss on long-tail returns" tone="bad" />
            <Stat label="Amazon Recovery" value="₹350+" caption="Net value reclaimed per return" tone="good" />
            <Stat label="Logistics Saved" value="100%" caption="Skips warehouse completely" tone="good" />
          </div>
        </div>

      </div>
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
    <div className="pt-4 sm:pt-0 sm:pl-6 first:pt-0 first:pl-0">
      <div className="text-xs font-bold text-[#565959] uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className={`text-4xl font-bold tracking-tight ${tone === "good" ? "text-[#007185]" : "text-[#B12704]"}`}>
          {value}
        </span>
      </div>
      <div className="flex items-start gap-1.5 text-xs text-[#0F1111]">
        {tone === "good" ? (
          <CheckCircle2 className="size-3.5 text-[#007185] mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="size-3.5 text-[#B12704] mt-0.5 shrink-0" />
        )}
        <span>{caption}</span>
      </div>
    </div>
  );
}
