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

 // Determine location for neighbor matching:
 // If this is a resell (returnId provided), use the BUYER's location from the original return
 // Otherwise use the seller's own location
 const { returnId } = req.body;
 let matchCoords = seller.location!.coordinates as [number, number];
 if (returnId) {
 const originalReturn = await ReturnModel.findById(returnId).lean();
 if (originalReturn?.sellerLocation?.coordinates) {
 matchCoords = originalReturn.sellerLocation.coordinates as [number, number];
 }
 }

 const sellerCoords = seller.location!.coordinates as [number, number];
 const finalPrice = pickFinalPrice(grading.suggestedPriceMin, grading.suggestedPriceMax);
 const neighbor = await findNeighborMatches(matchCoords, product.category);
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
 originalSellerId: product.sellerId ?? null, // original seller who listed this product
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
 resellStatus: "PENDING_RESELL",
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

 // Credits are awarded to seller when the item is successfully resold (buyer picks up).

 // If this is a resell, mark the original return as listed
 if (returnId) {
 await ReturnModel.findByIdAndUpdate(returnId, { resellStatus: "LISTED_FOR_RESELL" });
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

// GET /api/returns/pending-resell — Returns assigned back to the original seller for resale
router.get("/pending-resell", requireAuth, async (req, res) => {
 const list = await ReturnModel.find({
 originalSellerId: req.user!.id,
 resellStatus: "PENDING_RESELL",
 })
 .sort({ createdAt: -1 })
 .populate("productId")
 .lean();
 res.json(list);
});

// GET /api/returns/resell-products — Products from returns pending resell (for the dropdown)
router.get("/resell-products", requireAuth, async (req, res) => {
 const returns = await ReturnModel.find({
 originalSellerId: req.user!.id,
 resellStatus: "PENDING_RESELL",
 })
 .populate("productId")
 .lean();

 const products = returns
 .filter((r) => r.productId)
 .map((r) => {
 const p = r.productId as any;
 return {
 _id: String(p._id),
 title: p.title,
 category: p.category,
 brand: p.brand,
 originalPrice: p.originalPrice,
 images: p.images ?? [],
 returnId: String(r._id),
 aiGrade: r.aiGrade,
 aiSummary: r.aiSummary,
 isResellItem: true,
 };
 });
 res.json(products);
});

// PATCH /api/returns/:id/mark-resold — Seller marks a pending resell item as resold/listed
router.patch("/:id/mark-resold", requireAuth, async (req, res) => {
 const ret = await ReturnModel.findOne({
 _id: req.params.id,
 originalSellerId: req.user!.id,
 resellStatus: "PENDING_RESELL",
 });
 if (!ret) {
 res.status(404).json({ error: "Return not found or not pending resell" });
 return;
 }
 ret.resellStatus = "LISTED_FOR_RESELL";
 await ret.save();
 res.json({ ok: true, return: ret.toObject() });
});

// ============================================================
// BUYER RETURN — buyer returns an item they purchased
// ============================================================
router.post("/buyer-return", requireAuth, async (req, res, next) => {
 try {
 const { orderId, productId, reason } = req.body ?? {};
 if (!orderId || !productId) {
 res.status(400).json({ error: "orderId and productId required" });
 return;
 }

 const { OrderModel } = await import("../models/Order.js");
 const order = await OrderModel.findOne({ _id: orderId, userId: req.user!.id }).lean();
 if (!order) {
 res.status(404).json({ error: "Order not found" });
 return;
 }

 // Only delivered/paid orders can be returned
 if (order.status !== "DELIVERED" && order.status !== "PAID") {
 res.status(400).json({ error: `Only delivered orders can be returned. Current status: ${order.status}` });
 return;
 }

 // Check within 7 days
 const orderDate = new Date(order.createdAt as any);
 const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
 if (daysSinceOrder > 7) {
 res.status(400).json({ error: "Return window expired. Returns are only allowed within 7 days." });
 return;
 }

 // Find the product
 const product = await ProductModel.findById(productId).lean();
 if (!product) {
 res.status(404).json({ error: "Product not found" });
 return;
 }

 // Get the original seller of this product
 const originalSellerId = (product as any).sellerId || null;

 // Get the order item to find the price paid
 const orderItem = (order.items as any[]).find((i: any) => String(i.productId) === productId);
 const pricePaid = orderItem?.price || product.originalPrice;

 // Create the return record
 const buyer = await UserModel.findById(req.user!.id).lean();
 const buyerCoords = buyer?.location?.coordinates as [number, number] || [77.5946, 12.9716];

 // --- HYPERLOCAL ROUTING ---
 // Find nearby lockers and buyers relative to the BUYER's location
 // (the item is physically with the buyer)
 const neighbor = await findNeighborMatches(buyerCoords, product.category);

 // Estimate logistics cost: shipping back to seller warehouse
 const estimatedShippingCost = (product.weightGrams ?? 500) > 1000 ? 150 : 80;
 const estimatedResalePrice = Math.round(pricePaid * 0.7);

 // Decide route: if shipping > resale value OR nearby buyers exist, use Neighbor First
 const hasLocalBuyers = neighbor.buyersNearby.length > 0 && neighbor.nearestLocker !== null;
 const useNeighborFirst = hasLocalBuyers && (estimatedShippingCost > estimatedResalePrice * 0.3 || pricePaid <= 800);

 const route = useNeighborFirst ? "NEIGHBOR_FIRST" : "RENEWED";
 const routeReason = useNeighborFirst
 ? `Logistics cost (₹${estimatedShippingCost}) makes shipping unviable. ${neighbor.buyersNearby.length} local buyer(s) found within 20km. Item placed at nearby locker.`
 : "No nearby buyers or high-value item — routed for renewed resale.";

 const ret = await ReturnModel.create({
 productId: product._id,
 sellerId: req.user!.id, // buyer who is returning
 originalSellerId, // seller from whom it was purchased
 images: product.images || [],
 aiGrade: "B",
 aiSummary: reason || "Buyer initiated return within 7-day window.",
 defects: [],
 confidence: 0.85,
 priceBand: { min: Math.round(pricePaid * 0.6), max: Math.round(pricePaid * 0.85) },
 route,
 routeReason,
 estimatedRecovery: estimatedResalePrice,
 logisticsCost: useNeighborFirst ? 0 : estimatedShippingCost,
 sellerLocation: { type: "Point", coordinates: buyerCoords },
 status: useNeighborFirst && neighbor.nearestLocker ? "LISTED" : "ROUTED",
 refundAmount: pricePaid,
 sellerRefundIssued: true,
 resellStatus: "PENDING_RESELL",
 });

 // If Neighbor First — auto-create a listing at the nearby locker
 let listing = null;
 if (useNeighborFirst && neighbor.nearestLocker) {
 const { generatePickupCode, makeQrDataUrl } = await import("../utils/qrcode.js");
 const pickupCode = generatePickupCode();
 const qr = await makeQrDataUrl(JSON.stringify({ code: pickupCode, returnId: String(ret._id) }));

 listing = await ListingModel.create({
 returnId: ret._id,
 productId: product._id,
 sellerId: originalSellerId || req.user!.id,
 lockerId: neighbor.nearestLocker._id,
 priceFinal: estimatedResalePrice,
 title: product.title,
 grade: "B",
 images: product.images || [],
 summary: reason || "Buyer return — item in good condition.",
 defects: [],
 location: { type: "Point", coordinates: neighbor.nearestLocker.coordinates },
 status: "LIVE",
 pickupCode,
 qrDataUrl: qr,
 expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
 });

 // Notify nearby buyers
 await notifyNearbyBuyers({
 listing: { _id: listing._id, title: listing.title, priceFinal: listing.priceFinal, grade: listing.grade, location: listing.location! },
 category: product.category,
 });

 // Award locker partner credits and increment occupied
 await LockerModel.findByIdAndUpdate(neighbor.nearestLocker._id, { $inc: { occupied: 1 } });
 const lockerDoc = await LockerModel.findById(neighbor.nearestLocker._id).lean();
 if (lockerDoc?.userId) {
 await awardCredits(lockerDoc.userId, "LOCKER_STORAGE", {
 listingId: listing._id,
 returnId: ret._id,
 productId: product._id,
 descriptionOverride: `Returned item "${product.title}" assigned to your locker`,
 });
 }
 }

 // Update order status
 await OrderModel.findByIdAndUpdate(orderId, { status: "CANCELLED" });

 res.json({
 ok: true,
 message: useNeighborFirst
 ? `Return initiated. Item listed at ${neighbor.nearestLocker?.name ?? "nearby locker"} for local resale — zero shipping!`
 : "Return initiated successfully. Refund will be processed.",
 return: ret.toObject(),
 listing: listing ? listing.toObject() : null,
 nearbyBuyers: neighbor.buyersNearby.length,
 nearestLocker: neighbor.nearestLocker,
 });
 } catch (e) {
 next(e);
 }
});

// GET /api/returns/my-buyer-returns — Returns initiated by the buyer
router.get("/my-buyer-returns", requireAuth, async (req, res) => {
 const list = await ReturnModel.find({ sellerId: req.user!.id, originalSellerId: { $ne: null } })
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