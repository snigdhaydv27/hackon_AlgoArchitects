import { PreventionStatModel } from "../models/PreventionStat.js";

export interface PreventionInput {
 productId: string;
 variant: string; // e.g. size "7"
 userProfile: { footLengthMm?: number; preferredSize?: string };
}

export interface PreventionResult {
 warning: boolean;
 recommendedVariant?: string;
 message?: string;
 sampleSize?: number;
 confidence?: number;
}

function segmentForFoot(mm?: number): string | null {
 if (!mm) return null;
 const lo = Math.floor(mm / 10) * 10;
 return `footLengthMm:${lo}-${lo + 10}`;
}

export async function checkPurchase(input: PreventionInput): Promise<PreventionResult> {
 const seg = segmentForFoot(input.userProfile.footLengthMm);
 if (!seg) return { warning: false };

 const stat = await PreventionStatModel.findOne({
 productId: input.productId,
 profileSegment: seg,
 }).lean();
 if (!stat) return { warning: false };

 if (stat.variantPreference !== input.variant) {
 return {
 warning: true,
 recommendedVariant: stat.variantPreference,
 message: `${stat.sampleSize} customers with your foot profile prefer Size ${stat.variantPreference} in this product. You selected Size ${input.variant}.`,
 sampleSize: stat.sampleSize,
 confidence: stat.confidence,
 };
 }
 return { warning: false };
}

