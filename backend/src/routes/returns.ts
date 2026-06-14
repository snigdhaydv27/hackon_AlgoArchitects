import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/mockAuth.js";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { LockerModel } from "../models/Locker.js";
import { saveImage } from "../services/storage.js";
import { getGrader } from "../services/ai/provider.js";
import { decideRoute } from "../services/routing.js";
import { findNeighborMatches } from "../services/neighbor.js";
import { buildHealthCard } from "../services/healthCard.js";
import { notifyNearbyBuyers } from "../services/notify.js";
import { pickFinalPrice } from "../utils/pricing.js";
import { generatePickupCode, makeQrDataUrl } from "../utils/qrcode.js";
import { awardCredits } from "../services/greenCredits.js";

const router = Router();

// Create a return: upload images, AI-grade, decide route, optionally create listing.
router.post("/", requireAuth, upload.array("images", 10), async (req, res, next) => {
 try {
 const { productId } = req.body;
 if (!productId) {
 res.status(400).json({ error: "productId required" });
 return;
 }
 const files = req.files as Express.Multer.File[] | undefined;
 if (!files || files.length < 5) {
 res.status(400).json({ error: "Minimum 5 images required" });
 return;
 }

 const [product, seller] = await Promise.all([
 ProductModel.findById(productId).lean(),
 UserModel.findById(req.user!.id).lean(),
 ]);
 if (!product) {
 res.status(404).json({ error: "Product not found" });
 return;
 }
 if (!seller) {
 res.status(404).json({ error: "Seller not found" });
 return;
 }

 const stored = await saveImage(files[0].buffer, files[0].mimetype);
 // Save all images
 const allStored = await Promise.all(
 files.map((f) => saveImage(f.buffer, f.mimetype))
 );
 const allUrls = allStored.map((s) => s.url);

 const grader = getGrader();
 const grading = await grader.grade(
 [{ mime: stored.mime, base64: stored.base64 }],
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
 finalPrice <= 800 && neighbor.buyersNearby.length > 0 && neighbor.nearestLocker !== null;

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
 images: allUrls,
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
 });

 let listing = null;
 let healthCard = null;

 // For NEIGHBOR_FIRST and RENEWED, create a Listing
 if (
 (decision.route === "NEIGHBOR_FIRST" || decision.route === "RENEWED") &&
 neighbor.nearestLocker
 ) {
 const pickupCode = generatePickupCode();
 const qr = await makeQrDataUrl(
 JSON.stringify({ code: pickupCode, returnId: String(ret._id) })
 );
 listing = await ListingModel.create({
 returnId: ret._id,
 productId: product._id,
 sellerId: seller._id,
 lockerId: neighbor.nearestLocker._id,
 priceFinal: finalPrice,
 title: product.title,
 grade: grading.grade,
 images: allUrls,
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
 // Auto-notify verified nearby buyers when a Neighbor First listing goes LIVE.
 if (decision.route === "NEIGHBOR_FIRST") {
 await notifyNearbyBuyers({
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

 // Award credits to locker partner and update occupied count
 if (neighbor.nearestLocker) {
 await LockerModel.findByIdAndUpdate(neighbor.nearestLocker._id, { $inc: { occupied: 1 } });
 const lockerDoc = await LockerModel.findById(neighbor.nearestLocker._id).lean();
 if (lockerDoc?.userId) {
 await awardCredits(lockerDoc.userId, "LOCKER_STORAGE", {
 listingId: listing._id,
 returnId: ret._id,
 productId: product._id,
 descriptionOverride: `Item "${product.title}" assigned to your locker for local resale`,
 });
 }
 }
 }

 // Always issue full refund to seller (per spec, seller never penalized)
 ret.sellerRefundIssued = true;
 await ret.save();

 // Reward the seller for keeping the item out of landfill (non-blocking).
 if (decision.route === "DONATE") {
 await awardCredits(seller._id, "DONATION", { returnId: ret._id });
 } else if (decision.route !== "RECYCLE") {
 await awardCredits(seller._id, "RETURN_DIVERTED", { returnId: ret._id });
 }

 res.json({
 return: ret.toObject(),
 grading,
 decision,
 neighbor,
 listing: listing ? listing.toObject() : null,
 healthCard,
 product,
 });
 } catch (e) {
 next(e);
 }
});

router.get("/", requireAuth, async (req, res) => {
 const list = await ReturnModel.find({ sellerId: req.user!.id })
 .sort({ createdAt: -1 })
 .populate("productId")
 .lean();
 res.json(list);
});

router.get("/:id", requireAuth, async (req, res) => {
 const ret = await ReturnModel.findById(req.params.id).populate("productId").lean();
 if (!ret) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 res.json(ret);
});

export default router;