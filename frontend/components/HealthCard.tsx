import { ShieldCheck, BadgeCheck, Box, Package } from "lucide-react";
import { GradeBadge } from "./GradeBadge";
import { ImageSlider } from "./ImageSlider";

export interface HealthCardData {
 grade: "A" | "B" | "C" | "D";
 gradeLabel: string;
 summary: string;
 defects: string[];
 verifiedBy: string;
 badges: string[];
 trustPoints: string[];
 finalPrice: number;
 originalPrice: number;
 savingsPercent: number;
}

export function HealthCard({ data, image, images }: { data: HealthCardData; image?: string; images?: string[] }) {
 const allImages = images && images.length > 0 ? images : image ? [image] : [];
 return (
 <div className="card overflow-hidden">
 <div className="bg-gradient-to-br from-brand-50 to-white p-5 border-b border-slate-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-brand-700 font-semibold">
 <ShieldCheck className="size-5" />
 Product Health Card
 </div>
 <GradeBadge grade={data.grade} size="sm" />
 </div>
 <p className="mt-3 text-sm text-slate-700">{data.summary}</p>
 </div>

 {allImages.length > 0 && (
 <div className="relative aspect-video bg-slate-50">
 <ImageSlider images={allImages} alt="Product" className="w-full h-full" />
 </div>
 )}

 <div className="p-5 space-y-5">
 <div className="flex items-baseline justify-between">
 <div>
 <div className="text-xs uppercase text-slate-500">Final price</div>
 <div className="text-3xl font-bold text-brand-700">₹{data.finalPrice}</div>
 </div>
 <div className="text-right">
 <div className="text-xs uppercase text-slate-500">Original</div>
 <div className="text-lg text-slate-400 line-through">₹{data.originalPrice}</div>
 <div className="text-xs text-brand-600 font-medium">
 Save {data.savingsPercent}%
 </div>
 </div>
 </div>

 {data.defects.length > 0 && (
 <div>
 <div className="text-xs uppercase text-slate-500 mb-2">Noted defects</div>
 <ul className="space-y-1 text-sm text-slate-700">
 {data.defects.map((d, i) => (
 <li key={i} className="flex items-start gap-2">
 <span className="text-amber-500 mt-1">•</span>
 {d}
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="flex flex-wrap gap-2">
 {data.badges.map((b) => (
 <span
 key={b}
 className="pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
 >
 <BadgeCheck className="size-3" />
 {b}
 </span>
 ))}
 </div>

 <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm text-slate-700">
 <div className="flex items-center gap-2 text-slate-900 font-medium">
 <Box className="size-4 text-brand-600" />
 Why this is safe to buy
 </div>
 {data.trustPoints.map((t, i) => (
 <div key={i} className="flex gap-2">
 <span className="text-brand-500">✓</span>
 <span>{t}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}


