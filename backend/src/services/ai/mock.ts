import { GradingContext, GradingProvider, GradingResult, ImageInput } from "./types.js";

// Deterministic but varied mock — used when no API key is configured.
// Picks grade based on a hash of the image bytes so the same upload always grades the same.
export class MockGrader implements GradingProvider {
 name = "mock" as const;

 async grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();
 await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

 // Use all images in the hash for more varied results
 const combined = images.map((img) => img.base64.slice(0, 64)).join("");
 const hash = simpleHash(combined);
 const grades = ["A", "B", "B", "C", "D"] as const;
 const grade = grades[hash % grades.length];

 const bands: Record<typeof grade, [number, number]> = {
 A: [0.85, 0.95],
 B: [0.6, 0.8],
 C: [0.35, 0.55],
 D: [0.05, 0.15],
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
 A: `Like-new ${ctx.title}. No visible wear. All ${images.length} photos confirm pristine condition.`,
 B: `Lightly used ${ctx.title}. Fully functional with minor cosmetic marks visible in ${images.length} angle review.`,
 C: `Used ${ctx.title} with visible wear across ${images.length} photos. Refurbish recommended.`,
 D: `Heavily worn ${ctx.title}. ${images.length}-photo analysis confirms damage. Best routed to recycling/donation.`,
 };

 return {
 grade,
 defects: defectsByGrade[grade],
 summary: summaryByGrade[grade],
 suggestedPriceMin: min,
 suggestedPriceMax: max,
 confidence: Math.min(0.95, 0.7 + images.length * 0.03), // more images = higher confidence
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
