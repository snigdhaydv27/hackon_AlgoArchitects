


import { z } from "zod";
import { GradingContext } from "./types.js";

const Schema = z.object({
 grade: z.enum(["A", "B", "C", "D"]),
 defects: z.array(z.string()).default([]),
 summary: z.string().min(1),
 suggestedPriceMin: z.number().nonnegative(),
 suggestedPriceMax: z.number().nonnegative(),
 confidence: z.number().min(0).max(1),
});

export function parseGradingJson(raw: string, ctx: GradingContext) {
 const cleaned = raw
 .trim()
 .replace(/^```(?:json)?/i, "")
 .replace(/```$/i, "")
 .trim();
 const start = cleaned.indexOf("{");
 const end = cleaned.lastIndexOf("}");
 const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  let obj: unknown;
  try {
    obj = JSON.parse(slice);
  } catch (e) {
    // Fallback: degrade gracefully.
    console.warn(`[ai] JSON.parse failed. slice="${slice.slice(0, 300)}"`);
    return {
 grade: "C" as const,
 defects: ["Could not parse AI response"],
 summary: "Image needs manual review",
 suggestedPriceMin: Math.round(ctx.originalPrice * 0.3),
 suggestedPriceMax: Math.round(ctx.originalPrice * 0.5),
 confidence: 0.3,
 };
 }
 const parsed = Schema.parse(obj);
 if (parsed.suggestedPriceMin > parsed.suggestedPriceMax) {
 [parsed.suggestedPriceMin, parsed.suggestedPriceMax] = [
 parsed.suggestedPriceMax,
 parsed.suggestedPriceMin,
 ];
 }
 return parsed;
}

