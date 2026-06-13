import mongoose from "mongoose";
import { GreenCreditModel, CreditReason } from "../models/GreenCredit.js";
import { UserModel } from "../models/User.js";
import { logger } from "../config/logger.js";

// How many points each circular action is worth. Tweak freely.
export const CREDIT_RULES: Record<CreditReason, { credits: number; label: string }> = {
 LOCAL_PICKUP: { credits: 50, label: "Picked up locally — skipped the warehouse trip" },
 RETURN_DIVERTED: { credits: 30, label: "Gave a return a second life instead of landfill" },
 DONATION: { credits: 40, label: "Donated to an NGO instead of discarding" },
 RETURN_PREVENTED: { credits: 20, label: "Avoided a return before it happened" },
};

export interface AwardOptions {
 listingId?: mongoose.Types.ObjectId | string;
 returnId?: mongoose.Types.ObjectId | string;
 productId?: mongoose.Types.ObjectId | string;
 descriptionOverride?: string;
}

/**
 * Award green credits for a circular action.
 *
 * NON-BLOCKING BY DESIGN: this swallows its own errors and never throws, so a
 * failure here can never break a return, pickup, or prevention flow. Credits are
 * a bonus layer on top of the core product, never a dependency.
 */
export async function awardCredits(
 userId: mongoose.Types.ObjectId | string,
 reason: CreditReason,
 opts: AwardOptions = {}
): Promise<void> {
 try {
 const rule = CREDIT_RULES[reason];
 await GreenCreditModel.create({
 userId,
 amount: rule.credits,
 reason,
 description: opts.descriptionOverride ?? rule.label,
 listingId: opts.listingId,
 returnId: opts.returnId,
 productId: opts.productId,
 });
 await UserModel.findByIdAndUpdate(userId, { $inc: { greenCredits: rule.credits } });
 logger.info({ userId: String(userId), reason, credits: rule.credits }, "Green credits awarded");
 } catch (e) {
 logger.warn({ err: e, userId: String(userId), reason }, "Failed to award green credits (non-fatal)");
 }
}

export interface CreditSummary {
 balance: number;
 history: {
 amount: number;
 reason: CreditReason;
 description: string;
 createdAt: Date;
 }[];
}

export async function getCreditSummary(
 userId: mongoose.Types.ObjectId | string
): Promise<CreditSummary> {
 const [user, history] = await Promise.all([
 UserModel.findById(userId).lean(),
 GreenCreditModel.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
 ]);
 return {
 balance: user?.greenCredits ?? 0,
 history: history.map((h) => ({
 amount: h.amount,
 reason: h.reason as CreditReason,
 description: h.description,
 createdAt: h.createdAt as Date,
 })),
 };
}
