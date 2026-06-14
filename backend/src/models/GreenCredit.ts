import mongoose, { Schema, InferSchemaType } from "mongoose";

// Reasons a customer earns green credits — each maps to a real circular action.
export const CREDIT_REASONS = [
 "LOCAL_PICKUP", // buyer completed a Neighbor First locker pickup
 "RETURN_DIVERTED", // seller's return routed to resale/refurbish instead of landfill
 "DONATION", // item donated to an NGO instead of discarded
 "RETURN_PREVENTED", // buyer heeded a prevention warning — return never happened
 "LOCKER_STORAGE", // locker partner stored and facilitated a return handoff
] as const;

export type CreditReason = (typeof CREDIT_REASONS)[number];

const GreenCreditSchema = new Schema(
 {
 userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
 amount: { type: Number, required: true },
 reason: { type: String, enum: CREDIT_REASONS, required: true },
 description: { type: String, required: true },
 listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
 returnId: { type: Schema.Types.ObjectId, ref: "Return" },
 productId: { type: Schema.Types.ObjectId, ref: "Product" },
 },
 { timestamps: true }
);

GreenCreditSchema.index({ userId: 1, createdAt: -1 });

export type GreenCredit = InferSchemaType<typeof GreenCreditSchema> & {
 _id: mongoose.Types.ObjectId;
};
export const GreenCreditModel = mongoose.model("GreenCredit", GreenCreditSchema);
