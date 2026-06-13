

import mongoose, { Schema, InferSchemaType } from "mongoose";

const PointSchema = new Schema(
 {
 type: { type: String, enum: ["Point"], default: "Point" },
 coordinates: { type: [Number], required: true }, // [lng, lat]
 },
 { _id: false }
);

const UserSchema = new Schema(
 {
 name: { type: String, required: true },
 role: { type: String, enum: ["seller", "buyer", "admin", "small_seller"], required: true },
 email: { type: String, sparse: true, unique: true },
 cognitoSub: { type: String, sparse: true, unique: true },
 avatar: { type: String },
 tagline: { type: String },
 location: { type: PointSchema, required: true },
 address: { type: String, default: "" },
 interests: { type: [String], default: [] },
 profile: {
 footLengthMm: { type: Number },
 preferredSize: { type: String },
 brand: { type: String },
 },
 verified: { type: Boolean, default: true },
 razorpayKeyId: { type: String, default: "" },
 razorpayKeySecret: { type: String, default: "" },
 },
 { timestamps: true }
);

UserSchema.index({ location: "2dsphere" });

export type User = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel = mongoose.model("User", UserSchema);

