import mongoose, { Schema, InferSchemaType } from "mongoose";

const NotificationSchema = new Schema(
 {
 userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
 title: { type: String, required: true },
 body: { type: String, required: true },
 listingId: { type: Schema.Types.ObjectId, ref: "Listing" },
 kind: {
 type: String,
 enum: ["NEIGHBOR_LISTING", "SYSTEM", "PAYMENT", "PICKUP", "RETURN_RECEIVED"],
 default: "NEIGHBOR_LISTING",
 },
 distanceKm: { type: Number },
 read: { type: Boolean, default: false },
 },
 { timestamps: true }
);

export type Notification = InferSchemaType<typeof NotificationSchema> & {
 _id: mongoose.Types.ObjectId;
};
export const NotificationModel = mongoose.model("Notification", NotificationSchema);