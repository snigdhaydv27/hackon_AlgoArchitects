import { Router } from "express";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { getGrader } from "../services/ai/provider.js";
import { decideRoute } from "../services/routing.js";
import { findNeighborMatches } from "../services/neighbor.js";
import { buildHealthCard } from "../services/healthCard.js";
import { notifyNearbyBuyers } from "../services/notify.js";
import { pickFinalPrice } from "../utils/pricing.js";
import { generatePickupCode, makeQrDataUrl } from "../utils/qrcode.js";
import { verifyWebhookSignature } from "../middleware/security.js";
import { validateBody, schemas } from "../middleware/validate.js";
import { env } from "../config/env.js";

const router = Router();

// Webhook authentication: HMAC in production, open in demo
router.post("/return-initiated",
  verifyWebhookSignature(env.webhookSecret),
  validateBody(schemas.webhookReturn),
  async (req, res, next) => {
 try {
 const { sellerId, productId } = req.body ?? {};
 if (!sellerId || !productId) {
 res.status(400).json({ error: "sellerId and productId required" });
 return;
 }
 const [product, seller] = await Promise.all([
 ProductModel.findById(productId).lean(),
 UserModel.findById(sellerId).lean(),
 ]);
 if (!product) {
 res.status(404).json({ error: "Product not found" });
 return;
 }
 if (!seller) {
 res.status(404).json({ error: "Seller not found" });
 return;
 }

 // For the simulator, we use the existing seeded image of the product as the "return photo"
 // and pass a blank base64 so the grader either uses real AI on a placeholder or the mock.
 const grader = getGrader();
 const grading = await grader.grade(
 [{ mime: "image/jpeg", base64: makePlaceholderJpeg() }],
 {
 title: product.title,
 category: product.category,
 brand: product.brand ?? undefined,
 originalPrice: product.originalPrice,
 }
 );

 const sellerCoords = seller.location!.coordinates as [number, number];
 const finalPrice = pickFinalPrice(grading.suggestedPriceMin, grading.suggestedPriceMax);
 const neighbor = await findNeighborMatches(sellerCoords, product.category);
 const hasLocalBuyers =
 neighbor.buyersNearby.length > 0 && neighbor.nearestLocker !== null;

 const decision = decideRoute({
 grade: grading.grade,
 suggestedPrice: finalPrice,
 originalPrice: product.originalPrice,
 hasLocalBuyers,
 weightGrams: product.weightGrams ?? 500,
 category: product.category,
 });

 const ret = await ReturnModel.create({
 productId: product._id,
 sellerId: seller._id,
 images: product.images,
 aiGrade: grading.grade,
 aiSummary: grading.summary,
 defects: grading.defects,
 confidence: grading.confidence,
 priceBand: { min: grading.suggestedPriceMin, max: grading.suggestedPriceMax },
 route: decision.route,
 routeReason: decision.reason,
 estimatedRecovery: decision.estimatedRecovery,
 logisticsCost: decision.logisticsCost,
 sellerLocation: { type: "Point", coordinates: sellerCoords },
 status: "ROUTED",
 refundAmount: product.originalPrice,
 sellerRefundIssued: true,
 });

 let listing = null;
 let healthCard = null;
 let notifiedBuyers = 0;

 if (
 (decision.route === "NEIGHBOR_FIRST" || decision.route === "RENEWED") &&
 neighbor.nearestLocker
 ) {
 const pickupCode = generatePickupCode();
 const qr = await makeQrDataUrl(JSON.stringify({ code: pickupCode, returnId: String(ret._id) }));
 listing = await ListingModel.create({
 returnId: ret._id,
 productId: product._id,
 sellerId: seller._id,
 lockerId: neighbor.nearestLocker._id,
 priceFinal: finalPrice,
 title: product.title,
 grade: grading.grade,
 images: product.images,
 summary: grading.summary,
 defects: grading.defects,
 location: { type: "Point", coordinates: neighbor.nearestLocker.coordinates },
 status: "LIVE",
 pickupCode,
 qrDataUrl: qr,
 expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
 });
 ret.status = "LISTED";
 await ret.save();
 healthCard = buildHealthCard({
 grading,
 finalPrice,
 originalPrice: product.originalPrice,
 });
 // AUTO-NOTIFY nearby verified buyers
 if (decision.route === "NEIGHBOR_FIRST") {
 notifiedBuyers = await notifyNearbyBuyers({
 listing: {
 _id: listing._id,
 title: listing.title,
 priceFinal: listing.priceFinal,
 grade: listing.grade,
 location: listing.location!,
 },
 category: product.category,
 });
 }
 }

 res.json({
 ok: true,
 simulated: true,
 message: `Webhook processed: ${product.title} graded ${grading.grade}, routed to ${decision.route}, notified ${notifiedBuyers} buyers`,
 return: ret.toObject(),
 grading,
 decision,
 neighbor,
 listing: listing ? listing.toObject() : null,
 healthCard,
 notifiedBuyers,
 });
 } catch (e) {
 next(e);
 }
});

// 1x1 white JPEG as base64 — used by the webhook simulator when no real image is provided.
// Real grading would receive the actual return photo from the parent platform.
function makePlaceholderJpeg(): string {
 return "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/9oACAEBAAA/AP8Awn/9k=";
}

export default router;