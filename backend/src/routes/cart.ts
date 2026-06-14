import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { CartModel } from "../models/Cart.js";
import { ProductModel } from "../models/Product.js";
import { OrderModel } from "../models/Order.js";
import { ListingModel } from "../models/Listing.js";
import { env } from "../config/env.js";
import Razorpay from "razorpay";
import crypto from "node:crypto";

const router = Router();

// Get cart
router.get("/", requireAuth, async (req, res) => {
  let cart = await CartModel.findOne({ userId: req.user!.id }).populate("items.productId");
  if (!cart) {
    cart = await CartModel.create({ userId: req.user!.id, items: [] });
  }
  res.json(cart);
});

// Add to cart
router.post("/add", requireAuth, async (req, res) => {
  const { productId, variant, quantity } = req.body ?? {};
  if (!productId) {
    res.status(400).json({ error: "productId required" });
    return;
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  let cart = await CartModel.findOne({ userId: req.user!.id });
  if (!cart) {
    cart = await CartModel.create({ userId: req.user!.id, items: [] });
  }

  // Check if item already in cart with same variant
  const existing = cart.items.find(
    (item) => String(item.productId) === productId && item.variant === (variant || "")
  );

  if (existing) {
    existing.quantity = (existing.quantity || 1) + (quantity || 1);
  } else {
    cart.items.push({ productId, variant: variant || "", quantity: quantity || 1 } as any);
  }

  await cart.save();
  await cart.populate("items.productId");
  res.json(cart);
});

// Remove from cart
router.delete("/item/:itemId", requireAuth, async (req, res) => {
  const cart = await CartModel.findOne({ userId: req.user!.id });
  if (!cart) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }
  cart.items = cart.items.filter((item) => String((item as any)._id) !== req.params.itemId) as any;
  await cart.save();
  await cart.populate("items.productId");
  res.json(cart);
});

// Update quantity
router.put("/item/:itemId", requireAuth, async (req, res) => {
  const { quantity } = req.body ?? {};
  const cart = await CartModel.findOne({ userId: req.user!.id });
  if (!cart) {
    res.status(404).json({ error: "Cart not found" });
    return;
  }
  const item = cart.items.find((i) => String((i as any)._id) === req.params.itemId);
  if (item) {
    item.quantity = Math.max(1, quantity || 1);
  }
  await cart.save();
  await cart.populate("items.productId");
  res.json(cart);
});

// Checkout — create order + Razorpay order (or demo mode instant confirm)
router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const { shippingAddress } = req.body ?? {};
    if (!shippingAddress) {
      res.status(400).json({ error: "shippingAddress required" });
      return;
    }

    const cart = await CartModel.findOne({ userId: req.user!.id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    // Build order items
    const orderItems = cart.items.map((item) => {
      const product = item.productId as any;
      return {
        productId: product._id,
        title: product.title,
        variant: item.variant || "",
        price: product.originalPrice,
        quantity: item.quantity || 1,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Create order
    const order = await OrderModel.create({
      userId: req.user!.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "PENDING",
    });

    // Demo mode: skip Razorpay, instantly mark as PAID and simulate delivery
    if (env.isDemo || !env.razorpayKeyId || !env.razorpayKeySecret) {
      order.status = "DELIVERED";
      order.paymentRef = `demo_${Date.now()}`;
      await order.save();
      // Clear cart
      await CartModel.findOneAndUpdate({ userId: req.user!.id }, { items: [] });
      res.json({
        order: order.toObject(),
        demoMode: true,
      });
      return;
    }

    // Production mode: Create Razorpay order for real payment
    const razorpay = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
    const rzpOrder = await (razorpay as any).orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: { orderId: String(order._id), userId: String(req.user!.id) },
    });
    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.json({
      order: order.toObject(),
      razorpayOrder: rzpOrder,
      keyId: env.razorpayKeyId,
    });
  } catch (e) {
    next(e);
  }
});

// Verify payment
router.post("/verify-payment", requireAuth, async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};

  if (!env.razorpayKeySecret) {
    res.status(400).json({ error: "Payment not configured" });
    return;
  }

  const expected = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  order.status = "DELIVERED";
  order.paymentRef = razorpay_payment_id;
  await order.save();

  // Clear cart after successful payment
  await CartModel.findOneAndUpdate({ userId: req.user!.id }, { items: [] });

  res.json({ ok: true, order: order.toObject() });
});

// Mark order as delivered (for admin or automated delivery simulation)
router.patch("/orders/:orderId/deliver", requireAuth, async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.orderId, userId: req.user!.id });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.status === "DELIVERED") {
    res.json({ ok: true, order: order.toObject() });
    return;
  }
  order.status = "DELIVERED";
  await order.save();
  res.json({ ok: true, order: order.toObject() });
});

// Get orders
router.get("/orders", requireAuth, async (req, res) => {
  const orders = await OrderModel.find({ userId: req.user!.id }).sort({ createdAt: -1 }).lean();

  // Also fetch listings purchased by this buyer (marketplace purchases)
  const listings = await ListingModel.find({
    buyerId: req.user!.id,
    status: { $in: ["RESERVED", "DROPPED", "PAID", "COMPLETE"] },
  }).sort({ updatedAt: -1 }).lean();

  // Normalize returnedProductIds to strings for consistent frontend comparison
  const normalizedOrders = orders.map((o) => ({
    ...o,
    returnedProductIds: (o.returnedProductIds ?? []).map((id: any) => String(id)),
  }));

  // Convert listings to Order-like format so the frontend can display them uniformly
  const listingOrders = listings.map((l) => ({
    _id: String(l._id),
    items: [{
      productId: String(l.productId),
      title: l.title,
      variant: `Grade ${l.grade}`,
      price: l.priceFinal,
      quantity: 1,
    }],
    totalAmount: l.priceFinal,
    shippingAddress: "Pickup from locker",
    status: mapListingStatus(l.status),
    createdAt: (l as any).createdAt ?? (l as any).updatedAt ?? new Date().toISOString(),
    returnedProductIds: [] as string[],
    _source: "listing",
  }));

  // Merge and sort by date
  const all = [...normalizedOrders, ...listingOrders].sort(
    (a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime()
  );
  res.json(all);
});

function mapListingStatus(status: string): string {
  switch (status) {
    case "RESERVED": return "PENDING";
    case "DROPPED": return "PENDING";
    case "PAID": return "PAID";
    case "COMPLETE": return "DELIVERED";
    default: return "PENDING";
  }
}

export default router;
