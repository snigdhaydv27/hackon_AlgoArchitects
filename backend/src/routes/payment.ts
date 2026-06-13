import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { ListingModel } from "../models/Listing.js";
import { ReturnModel } from "../models/Return.js";
import { createOrder, verifySignature, isConfigured } from "../services/payment.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/config", (_req, res) => {
 res.json({
 configured: isConfigured(),
 keyId: env.razorpayKeyId, // public key id is safe to expose
 });
});

// Create a Razorpay order for a listing.
router.post("/order/:listingId", requireAuth, async (req, res, next) => {
 try {
 const listing = await ListingModel.findById(req.params.listingId);
 if (!listing) {
 res.status(404).json({ error: "Listing not found" });
 return;
 }
 if (!isConfigured()) {
 // Fall back to a mock order so the demo still works without Razorpay keys.
 const mockOrder = {
 id: `order_mock_${Date.now()}`,
 amount: listing.priceFinal * 100,
 currency: "INR",
 receipt: String(listing._id),
 mock: true,
 };
 res.json({ order: mockOrder, mock: true });
 return;
 }
 const order = await createOrder({
 amountInr: listing.priceFinal,
 receipt: `reloop_${listing._id}`,
 notes: {
 listingId: String(listing._id),
 title: listing.title,
 buyerId: String(req.user!.id),
 },
 });
 res.json({ order, mock: false, keyId: env.razorpayKeyId });
 } catch (e) {
 next(e);
 }
});

// Verify payment after Razorpay checkout finishes
router.post("/verify/:listingId", requireAuth, async (req, res, next) => {
 try {
 const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mock } = req.body ?? {};
 const listing = await ListingModel.findById(req.params.listingId);
 if (!listing) {
 res.status(404).json({ error: "Listing not found" });
 return;
 }
 if (!mock) {
 const ok = verifySignature({
 orderId: razorpay_order_id,
 paymentId: razorpay_payment_id,
 signature: razorpay_signature,
 });
 if (!ok) {
 res.status(400).json({ error: "Invalid Razorpay signature" });
 return;
 }
 }
 listing.status = "PAID";
 listing.paymentRef = razorpay_payment_id ?? `MOCK_${Date.now()}`;
 if (!listing.buyerId) listing.buyerId = req.user!.id as unknown as typeof listing.buyerId;
 await listing.save();
 await ReturnModel.findByIdAndUpdate(listing.returnId, { status: "PAID" });
 res.json({ ok: true, listing: listing.toObject() });
 } catch (e) {
 next(e);
 }
});

export default router;