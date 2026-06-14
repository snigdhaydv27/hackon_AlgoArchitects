import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { ListingModel } from "../models/Listing.js";
import { ReturnModel } from "../models/Return.js";
import { UserModel } from "../models/User.js";
import { createOrderWithSellerKeys, verifySignatureWithSecret } from "../services/payment.js";

const router = Router();

// Check if seller has Razorpay configured for a listing
router.get("/status/:listingId", requireAuth, async (req, res, next) => {
  try {
    const listing = await ListingModel.findById(req.params.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    const seller = await UserModel.findById(listing.sellerId).lean();
    const hasRazorpay = Boolean((seller as any)?.razorpayKeyId && (seller as any)?.razorpayKeySecret);
    res.json({
      hasRazorpay,
      payAtPickupAvailable: !hasRazorpay,
      amount: listing.priceFinal,
    });
  } catch (e) {
    next(e);
  }
});

// Create a Razorpay order for a listing — uses the SELLER's keys
router.post("/order/:listingId", requireAuth, async (req, res, next) => {
  try {
    const listing = await ListingModel.findById(req.params.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const seller = await UserModel.findById(listing.sellerId).lean();
    const sellerKeyId = (seller as any)?.razorpayKeyId;
    const sellerKeySecret = (seller as any)?.razorpayKeySecret;

    if (!sellerKeyId || !sellerKeySecret) {
      res.status(400).json({
        error: "Seller Razorpay not configured. Use Pay at Pickup instead.",
        payAtPickupAvailable: true,
      });
      return;
    }

    const order = await createOrderWithSellerKeys(
      { keyId: sellerKeyId, keySecret: sellerKeySecret },
      {
        amountInr: listing.priceFinal,
        receipt: `reloop_${listing._id}`,
        notes: {
          listingId: String(listing._id),
          title: listing.title,
          buyerId: String(req.user!.id),
          sellerId: String(listing.sellerId),
        },
      }
    );
    res.json({ order, keyId: sellerKeyId });
  } catch (e) {
    next(e);
  }
});

// Verify payment after Razorpay checkout finishes
router.post("/verify/:listingId", requireAuth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body ?? {};
    const listing = await ListingModel.findById(req.params.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const seller = await UserModel.findById(listing.sellerId).lean();
    const sellerKeySecret = (seller as any)?.razorpayKeySecret;

    if (!sellerKeySecret) {
      res.status(400).json({ error: "Seller payment not configured" });
      return;
    }

    const ok = verifySignatureWithSecret(sellerKeySecret, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!ok) {
      res.status(400).json({ error: "Invalid Razorpay signature" });
      return;
    }

    listing.status = "PAID";
    listing.paymentRef = razorpay_payment_id;
    if (!listing.buyerId) listing.buyerId = req.user!.id as unknown as typeof listing.buyerId;
    await listing.save();
    await ReturnModel.findByIdAndUpdate(listing.returnId, { status: "PAID" });

    res.json({ ok: true, listing: listing.toObject() });
  } catch (e) {
    next(e);
  }
});

// Pay at Pickup — buyer confirms they will pay UPI at the locker
router.post("/pay-at-pickup/:listingId", requireAuth, async (req, res, next) => {
  try {
    const listing = await ListingModel.findById(req.params.listingId);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    if (listing.status !== "RESERVED" && listing.status !== "DROPPED") {
      res.status(400).json({ error: `Cannot use pay-at-pickup when status is ${listing.status}` });
      return;
    }

    // Mark as PAID with a special reference indicating pay-at-pickup
    listing.status = "PAID";
    listing.paymentRef = `PAY_AT_PICKUP_${Date.now()}`;
    if (!listing.buyerId) listing.buyerId = req.user!.id as unknown as typeof listing.buyerId;
    await listing.save();
    await ReturnModel.findByIdAndUpdate(listing.returnId, { status: "PAID" });

    res.json({
      ok: true,
      method: "pay_at_pickup",
      message: "Pay at Pickup confirmed. Show your QR code at the locker and pay via UPI to the locker partner.",
      listing: listing.toObject(),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
