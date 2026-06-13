
import { Users, Sparkles, Wrench, Heart, Recycle as RecycleIcon } from "lucide-react";
import clsx from "clsx";

const ROUTE_META: Record<
 string,
 { title: string; tag: string; tone: string; icon: React.ComponentType<{ className?: string }> }
> = {
 NEIGHBOR_FIRST: {
 title: "Neighbor First",
 tag: "Hyperlocal locker handoff",
 tone: "from-brand-500 to-emerald-400",
 icon: Users,
 },
 RENEWED: {
 title: "Renewed Listing",
 tag: "Platform-verified resale",
 tone: "from-sky-500 to-indigo-400",
 icon: Sparkles,
 },
 REFURBISH: {
 title: "Refurbish Route",
 tag: "Repaired & re-listed",
 tone: "from-amber-500 to-orange-400",
 icon: Wrench,
 },
 DONATE: {
 title: "Donate to NGO",
 tag: "Better than landfill",
 tone: "from-rose-500 to-pink-400",
 icon: Heart,
 },
 RECYCLE: {
 title: "Certified Recycle",
 tag: "Never blind liquidation",
 tone: "from-slate-500 to-slate-700",
 icon: RecycleIcon,
 },
};

export function RoutingDecision({
 route,
 reason,
 estimatedRecovery,
 logisticsCost,
 netRecovery,
}: {
 route: string;
 reason: string;
 estimatedRecovery: number;
 logisticsCost: number;
 netRecovery: number;
}) {
 const meta = ROUTE_META[route] ?? ROUTE_META.RECYCLE;
 const Icon = meta.icon;
 return (
 <div className="card overflow-hidden">
 <div className={clsx("p-6 bg-gradient-to-br text-white", meta.tone)}>
 <div className="flex items-center gap-3">
 <div className="rounded-xl bg-white/20 p-2">
 <Icon className="size-6" />
 </div>
 <div>
 <div className="text-xs uppercase tracking-wide opacity-80">Smart Routing decided</div>
 <div className="text-2xl font-bold">{meta.title}</div>
 <div className="text-sm opacity-90">{meta.tag}</div>
 </div>
 </div>
 <p className="mt-4 text-sm opacity-90">{reason}</p>
 </div>
 <div className="grid grid-cols-3 divide-x divide-slate-200 text-center">
 <Stat label="Recovery" value={`₹${estimatedRecovery}`} good />
 <Stat label="Logistics" value={`₹${logisticsCost}`} bad={logisticsCost > 0} />
 <Stat label="Net" value={`₹${netRecovery}`} good={netRecovery > 0} />
 </div>
 </div>
 );
}

function Stat({
 label,
 value,
 good,
 bad,
}: {
 label: string;
 value: string;
 good?: boolean;
 bad?: boolean;
}) {
 return (
 <div className="p-4">
 <div className="text-xs text-slate-500">{label}</div>
 <div
 className={clsx(
 "text-xl font-bold",
 good ? "text-brand-600" : bad ? "text-rose-500" : "text-slate-700"
 )}
 >
 {value}
 </div>
 </div>
 );
}



