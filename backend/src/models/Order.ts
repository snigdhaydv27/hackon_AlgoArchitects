import mongoose, { Schema, InferSchemaType } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variant: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    paymentRef: { type: String },
    razorpayOrderId: { type: String },
  },
  { timestamps: true }
);

export type Order = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };
export const OrderModel = mongoose.model("Order", OrderSchema);
