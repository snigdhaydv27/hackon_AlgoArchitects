import clsx from "clsx";

const STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
 A: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "Like New" },
 B: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", label: "Lightly Used" },
 C: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", label: "Used" },
 D: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", label: "Heavy Wear" },
};

export function GradeBadge({ grade, size = "md" }: { grade: "A" | "B" | "C" | "D"; size?: "sm" | "md" | "lg" }) {
 const s = STYLES[grade];
 return (
 <div
 className={clsx(
 "inline-flex items-center gap-2 rounded-full ring-1",
 s.bg,
 s.text,
 s.ring,
 size === "lg" ? "px-4 py-2" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1"
 )}
 >
 <span className={clsx("font-bold", size === "lg" ? "text-xl" : "")}>Grade {grade}</span>
 <span className="text-xs opacity-80">· {s.label}</span>
 </div>
 );
}



