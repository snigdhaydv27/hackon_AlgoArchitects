import { GradingContext, GradingProvider, GradingResult } from "./types.js";

// Deterministic but varied mock — used when no API key is configured.
// Picks grade based on a hash of the image bytes so the same upload always grades the same.
export class MockGrader implements GradingProvider {
 name = "mock" as const;

 async grade(image: { mime: string; base64: string }, ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();
 await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

 const hash = simpleHash(image.base64.slice(0, 256));
 const grades = ["A", "B", "B", "C", "D"] as const;
 const grade = grades[hash % grades.length];

 const bands: Record<typeof grade, [number, number]> = {
 A: [0.7, 0.85],
 B: [0.5, 0.7],
 C: [0.3, 0.5],
 D: [0.1, 0.25],
 };
 const [lo, hi] = bands[grade];
 const min = Math.round(ctx.originalPrice * lo);
 const max = Math.round(ctx.originalPrice * hi);

 const defectsByGrade: Record<typeof grade, string[]> = {
 A: [],
 B: ["Faint cosmetic marks"],
 C: ["Visible scuffs", "Minor scratches near edge"],
 D: ["Heavy wear", "Functional but cosmetically damaged"],
 };
 const summaryByGrade: Record<typeof grade, string> = {
 A: `Like-new ${ctx.title}. No visible wear.`,
 B: `Lightly used ${ctx.title}. Fully functional with minor cosmetic marks.`,
 C: `Used ${ctx.title} with visible wear. Refurbish recommended.`,
 D: `Heavily worn ${ctx.title}. Best routed to recycling/donation.`,
 };

 return {
 grade,
 defects: defectsByGrade[grade],
 summary: summaryByGrade[grade],
 suggestedPriceMin: min,
 suggestedPriceMax: max,
 confidence: 0.78,
 latencyMs: Date.now() - start,
 provider: "mock",
 };
 }
}

function simpleHash(s: string): number {
 let h = 0;
 for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
 return Math.abs(h);
}

