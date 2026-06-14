import mongoose, { Schema, InferSchemaType } from "mongoose";

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: String, default: "" }, // size or color selected
    quantity: { type: Number, default: 1 },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export type Cart = InferSchemaType<typeof CartSchema> & { _id: mongoose.Types.ObjectId };
export const CartModel = mongoose.model("Cart", CartSchema);
