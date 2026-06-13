import mongoose, { Schema, InferSchemaType } from "mongoose";

export const LISTING_STATUS = [
 "LIVE",
 "RESERVED",
 "DROPPED",
 "PAID",
 "COMPLETE",
 "EXPIRED",
] as const;

const ListingSchema = new Schema(
 {
 returnId: { type: Schema.Types.ObjectId, ref: "Return", required: true },
 productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
 sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
 buyerId: { type: Schema.Types.ObjectId, ref: "User" },
 lockerId: { type: Schema.Types.ObjectId, ref: "Locker", required: true },
 priceFinal: { type: Number, required: true },
 title: { type: String, required: true },
 grade: { type: String, enum: ["A", "B", "C", "D"], required: true },
 images: { type: [String], default: [] },
 summary: { type: String },
 defects: { type: [String], default: [] },
 location: {
 type: { type: String, enum: ["Point"], default: "Point" },
 coordinates: { type: [Number], required: true },
 },
 status: { type: String, enum: LISTING_STATUS, default: "LIVE" },
 pickupCode: { type: String },
 qrDataUrl: { type: String },
 paymentRef: { type: String },
 expiresAt: { type: Date },
 },
 { timestamps: true }
);

ListingSchema.index({ location: "2dsphere" });
ListingSchema.index({ status: 1 });

export type Listing = InferSchemaType<typeof ListingSchema> & { _id: mongoose.Types.ObjectId };
export const ListingModel = mongoose.model("Listing", ListingSchema);

