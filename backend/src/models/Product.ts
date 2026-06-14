



import mongoose, { Schema, InferSchemaType } from "mongoose";

const ProductSchema = new Schema(
 {
 title: { type: String, required: true },
 category: { type: String, required: true },
 brand: { type: String },
 originalPrice: { type: Number, required: true },
 images: { type: [String], default: [] },
 description: { type: String },
 variants: {
 sizes: { type: [String], default: [] },
 colors: { type: [String], default: [] },
 },
 weightGrams: { type: Number, default: 500 },
 sellerId: { type: Schema.Types.ObjectId, ref: "User" }, // original seller who owns this product
 },
 { timestamps: true }
);

export type Product = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };
export const ProductModel = mongoose.model("Product", ProductSchema);



