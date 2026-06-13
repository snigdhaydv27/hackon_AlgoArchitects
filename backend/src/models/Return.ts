import mongoose, { Schema, InferSchemaType } from "mongoose";

export const ROUTE_VALUES = ["NEIGHBOR_FIRST", "RENEWED", "REFURBISH", "DONATE", "RECYCLE"] as const;
export type RouteType = (typeof ROUTE_VALUES)[number];

export const RETURN_STATUS = [
 "PENDING_GRADE",
 "GRADED",
 "ROUTED",
 "LISTED",
 "DROPPED",
 "PAID",
 "COMPLETE",
 "DONATED",
 "RECYCLED",
] as const;

const ReturnSchema = new Schema(
 {
 productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
 sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
 images: { type: [String], default: [] },
 aiGrade: { type: String, enum: ["A", "B", "C", "D"] },
 aiSummary: { type: String },
 defects: { type: [String], default: [] },
 confidence: { type: Number },
 priceBand: { min: Number, max: Number },
 route: { type: String, enum: ROUTE_VALUES },
 routeReason: { type: String },
 estimatedRecovery: { type: Number, default: 0 },
 logisticsCost: { type: Number, default: 0 },
 sellerLocation: {
 type: { type: String, enum: ["Point"], default: "Point" },
 coordinates: { type: [Number] },
 },
 status: { type: String, enum: RETURN_STATUS, default: "PENDING_GRADE" },
 refundAmount: { type: Number, default: 0 },
 sellerRefundIssued: { type: Boolean, default: false },
 },
 { timestamps: true }
);

ReturnSchema.index({ sellerLocation: "2dsphere" });

export type Return = InferSchemaType<typeof ReturnSchema> & { _id: mongoose.Types.ObjectId };
export const ReturnModel = mongoose.model("Return", ReturnSchema);

