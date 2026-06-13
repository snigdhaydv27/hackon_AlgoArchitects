
import mongoose, { Schema, InferSchemaType } from "mongoose";

const LockerSchema = new Schema(
 {
 name: { type: String, required: true },
 address: { type: String, required: true },
 partnerType: { type: String, enum: ["kirana", "standalone", "store"], default: "kirana" },
 location: {
 type: { type: String, enum: ["Point"], default: "Point" },
 coordinates: { type: [Number], required: true },
 },
 capacity: { type: Number, default: 20 },
 occupied: { type: Number, default: 0 },
 hours: { type: String, default: "8 AM – 10 PM" },
 contact: { type: String },
 },
 { timestamps: true }
);

LockerSchema.index({ location: "2dsphere" });

export type Locker = InferSchemaType<typeof LockerSchema> & { _id: mongoose.Types.ObjectId };
export const LockerModel = mongoose.model("Locker", LockerSchema);

