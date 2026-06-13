import mongoose, { Schema, InferSchemaType } from "mongoose";

const PreventionStatSchema = new Schema(
 {
 productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
 profileSegment: { type: String, required: true }, // e.g. "footLengthMm:255-265"
 variantPreference: { type: String, required: true }, // e.g. size "8"
 sampleSize: { type: Number, required: true },
 confidence: { type: Number, default: 0.85 },
 rationale: { type: String },
 },
 { timestamps: true }
);

PreventionStatSchema.index({ productId: 1, profileSegment: 1 });

export type PreventionStat = InferSchemaType<typeof PreventionStatSchema> & {
 _id: mongoose.Types.ObjectId;
};
export const PreventionStatModel = mongoose.model("PreventionStat", PreventionStatSchema);



