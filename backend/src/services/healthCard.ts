import { GradingResult } from "./ai/types.js";

export interface HealthCard {
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

const GRADE_LABELS: Record<HealthCard["grade"], string> = {
 A: "Like New",
 B: "Lightly Used",
 C: "Used",
 D: "Heavy Wear",
};

export function buildHealthCard(input: {
 grading: GradingResult;
 finalPrice: number;
 originalPrice: number;
}): HealthCard {
 const { grading, finalPrice, originalPrice } = input;
 const savings = Math.max(0, Math.round(((originalPrice - finalPrice) / originalPrice) * 100));
 return {
 grade: grading.grade,
 gradeLabel: GRADE_LABELS[grading.grade],
 summary: grading.summary,
 defects: grading.defects,
 verifiedBy: "ReLoop AI Verification",
 badges: ["Platform Verified", "AI-Graded", "Locker Pickup"],
 trustPoints: [
 "Inspected and graded by AI — no human guesswork",
 "Pickup at platform-managed locker — no strangers, no doorstep visits",
 "ReLoop holds payment until you pick up — fraud shield active",
 "Fixed price — no haggling",
 ],
 finalPrice,
 originalPrice,
 savingsPercent: savings,
 };
}

