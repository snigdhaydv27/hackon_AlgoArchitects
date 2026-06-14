import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/mockAuth.js";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { LockerModel } from "../models/Locker.js";
import { NotificationModel } from "../models/Notification.js";
import { saveImage } from "../services/storage.js";
import { getGrader } from "../services/ai/provider.js";
import { decideRoute } from "../services/routing.js";
import { findNeighborMatches } from "../services/neighbor.js";
import { buildHealthCard } from "../services/healthCard.js";
import { notifyNearbyBuyers } from "../services/notify.js";
import { pickFinalPrice } from "../utils/pricing.js";
import { generatePickupCode, makeQrDataUrl } from "../utils/qrcode.js";
import { awardCredits } from "../services/greenCredits.js";

function mapListingToOrderStatus(status: string): string {
 switch (status) {
 case "RESERVED": return "PENDING";
 case "DROPPED": return "PENDING";
 case "PAID": return "PAID";
 case "COMPLETE": return "DELIVERED";
 default: return "PENDING";
 }
}

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
 // Find returns where this seller is the originalSellerId (from buyer returns)
 // OR where this seller's products were returned (via product.sellerId lookup)
 const directReturns = await ReturnModel.find({
 originalSellerId: req.user!.id,
 resellStatus: "PENDING_RESELL",
 })
 .sort({ createdAt: -1 })
 .populate("productId")
 .lean();

 // Also find returns for products owned by this seller that might not have originalSellerId set
 const myProducts = await ProductModel.find({ sellerId: req.user!.id }).select("_id").lean();
 const myProductIds = myProducts.map((p) => p._id);

 let productReturns: any[] = [];
 if (myProductIds.length > 0) {
 productReturns = await ReturnModel.find({
 productId: { $in: myProductIds },
 resellStatus: "PENDING_RESELL",
 originalSellerId: { $in: [null, undefined] }, // only those not already linked
 })
 .sort({ createdAt: -1 })
 .populate("productId")
 .lean();

 // Fix: update these returns to set originalSellerId so they show up next time
 if (productReturns.length > 0) {
 const ids = productReturns.map((r) => r._id);
 await ReturnModel.updateMany(
 { _id: { $in: ids } },
 { originalSellerId: req.user!.id }
 );
 }
 }

 // Merge and deduplicate
 const allIds = new Set(directReturns.map((r) => String(r._id)));
 const merged = [...directReturns];
 for (const r of productReturns) {
 if (!allIds.has(String(r._id))) {
 merged.push(r);
 }
 }

 res.json(merged);
});

// GET /api/returns/resell-products — Products from returns pending resell (for the dropdown)
router.get("/resell-products", requireAuth, async (req, res) => {
 // Same logic as pending-resell: check both originalSellerId AND product ownership
 const myProducts = await ProductModel.find({ sellerId: req.user!.id }).select("_id").lean();
 const myProductIds = myProducts.map((p) => p._id);

 const returns = await ReturnModel.find({
 resellStatus: "PENDING_RESELL",
 $or: [
 { originalSellerId: req.user!.id },
 ...(myProductIds.length > 0 ? [{ productId: { $in: myProductIds } }] : []),
 ],
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

// POST /api/returns/resell-as-returned — Full auto-flow: seller picks a pending-resell item,
// uploads images, AI grades it, assigns to nearest locker, notifies nearby buyers — one click.
router.post("/resell-as-returned", requireAuth, upload.array("images", 10), async (req, res, next) => {
 try {
 const { returnId } = req.body;
 if (!returnId) {
 res.status(400).json({ error: "returnId required" });
 return;
 }

 // Find the pending resell return assigned to this seller
 const pendingReturn = await ReturnModel.findOne({
 _id: returnId,
 resellStatus: "PENDING_RESELL",
 $or: [
 { originalSellerId: req.user!.id },
 { productId: { $in: (await ProductModel.find({ sellerId: req.user!.id }).select("_id").lean()).map((p) => p._id) } },
 ],
 });
 if (!pendingReturn) {
 res.status(404).json({ error: "Return not found or not pending resell for you" });
 return;
 }

 const [product, seller] = await Promise.all([
 ProductModel.findById(pendingReturn.productId).lean(),
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

 // Use uploaded images if provided, otherwise reuse images from the original return
 const files = req.files as Express.Multer.File[] | undefined;
 let allUrls: string[];
 let gradeImages: { mime: string; base64: string }[];

 if (files && files.length >= 1) {
 const allStored = await Promise.all(
 files.map((f) => saveImage(f.buffer, f.mimetype))
 );
 allUrls = allStored.map((s) => s.url);
 gradeImages = allStored.map((s) => ({ mime: s.mime, base64: s.base64 }));
 } else {
 // Reuse existing images from the return for AI grading
 allUrls = pendingReturn.images ?? product.images ?? [];
 // For AI grading with existing images, create mock image data
 gradeImages = [{ mime: "image/jpeg", base64: Buffer.from("reuse-existing").toString("base64") }];
 }

 // AI grade the item
 const grader = getGrader();
 const grading = await grader.grade(
 gradeImages,
 {
 title: product.title,
 category: product.category,
 brand: product.brand ?? undefined,
 originalPrice: product.originalPrice,
 }
 );

 // Use buyer's location (from original return) for neighbor matching
 let matchCoords: [number, number] = seller.location!.coordinates as [number, number];
 if (pendingReturn.sellerLocation?.coordinates) {
 matchCoords = pendingReturn.sellerLocation.coordinates as [number, number];
 }

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

 let listing = null;
 let healthCard = null;

 // Create listing at nearest locker
 if (neighbor.nearestLocker) {
 const pickupCode = generatePickupCode();
 const qr = await makeQrDataUrl(
 JSON.stringify({ code: pickupCode, returnId: String(pendingReturn._id) })
 );
 listing = await ListingModel.create({
 returnId: pendingReturn._id,
 productId: product._id,
 sellerId: req.user!.id,
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
 expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
 });

 // Update return status
 pendingReturn.resellStatus = "LISTED_FOR_RESELL";
 pendingReturn.status = "LISTED";
 pendingReturn.aiGrade = grading.grade;
 pendingReturn.aiSummary = grading.summary;
 pendingReturn.defects = grading.defects;
 pendingReturn.confidence = grading.confidence;
 pendingReturn.priceBand = { min: grading.suggestedPriceMin, max: grading.suggestedPriceMax };
 pendingReturn.route = decision.route;
 pendingReturn.routeReason = decision.reason;
 pendingReturn.estimatedRecovery = decision.estimatedRecovery;
 pendingReturn.logisticsCost = decision.logisticsCost;
 await pendingReturn.save();

 healthCard = buildHealthCard({
 grading,
 finalPrice,
 originalPrice: product.originalPrice,
 });

 // Notify nearby buyers
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

 // Award credits to locker partner and update occupied count
 await LockerModel.findByIdAndUpdate(neighbor.nearestLocker._id, { $inc: { occupied: 1 } });
 const lockerDoc = await LockerModel.findById(neighbor.nearestLocker._id).lean();
 if (lockerDoc?.userId) {
 await awardCredits(lockerDoc.userId, "LOCKER_STORAGE", {
 listingId: listing._id,
 returnId: pendingReturn._id,
 productId: product._id,
 descriptionOverride: `Resell item "${product.title}" assigned to your locker`,
 });
 }
 } else {
 // No nearby locker — still mark as listed for resell (will show in shop)
 pendingReturn.resellStatus = "LISTED_FOR_RESELL";
 pendingReturn.aiGrade = grading.grade;
 pendingReturn.aiSummary = grading.summary;
 pendingReturn.defects = grading.defects;
 pendingReturn.route = decision.route;
 pendingReturn.routeReason = decision.reason;
 await pendingReturn.save();
 }

 res.json({
 ok: true,
 message: listing
 ? `Item listed at ${neighbor.nearestLocker?.name ?? "nearby locker"} for local resale. ${neighbor.buyersNearby.length} buyer(s) notified.`
 : "Item graded and marked for resale. No nearby locker found — will appear in online shop.",
 return: pendingReturn.toObject(),
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

 // Use atomic findOneAndUpdate to mark the product as returned in one step.
 // This prevents race conditions where multiple clicks could return the same item.
 const order = await OrderModel.findOneAndUpdate(
 {
 _id: orderId,
 userId: req.user!.id,
 returnedProductIds: { $ne: productId }, // only if NOT already returned
 },
 { $addToSet: { returnedProductIds: productId } },
 { new: true }
 ).lean();

 // Also check if this is a listing-based purchase
 const purchasedListing = !order
 ? await ListingModel.findOne({ _id: orderId, buyerId: req.user!.id }).lean()
 : null;

 if (!order && !purchasedListing) {
 // Could be that the order exists but item was already returned
 const existingOrder = await OrderModel.findOne({ _id: orderId, userId: req.user!.id }).lean();
 if (existingOrder && (existingOrder as any).returnedProductIds?.some((rid: any) => String(rid) === productId)) {
 res.status(400).json({ error: "This item has already been returned." });
 return;
 }
 res.status(404).json({ error: "Order not found" });
 return;
 }

 // Determine status and date based on source
 const sourceStatus = order ? order.status : mapListingToOrderStatus(purchasedListing!.status);
 const sourceDate = order
 ? new Date(order.createdAt as any)
 : new Date((purchasedListing as any).createdAt ?? (purchasedListing as any).updatedAt ?? Date.now());

 // Only delivered/paid orders can be returned
 if (sourceStatus !== "DELIVERED" && sourceStatus !== "PAID") {
 res.status(400).json({ error: `Only delivered/paid orders can be returned. Current status: ${sourceStatus}` });
 return;
 }

 // Check within 7 days
 const daysSinceOrder = (Date.now() - sourceDate.getTime()) / (1000 * 60 * 60 * 24);
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

 // Get the original seller of this product — try multiple sources:
 // 1. If purchased from a listing, use listing.sellerId
 // 2. If product has sellerId, use that
 // 3. Fallback: look at who created the product
 let originalSellerId = (product as any).sellerId || null;
 if (purchasedListing && purchasedListing.sellerId) {
 originalSellerId = purchasedListing.sellerId;
 }
 // If still null and we have an order, check if product has a seller
 if (!originalSellerId && order) {
 // Try to find the seller from any existing return or listing for this product
 const existingListing = await ListingModel.findOne({ productId }).lean();
 if (existingListing?.sellerId) {
 originalSellerId = existingListing.sellerId;
 }
 }

 // Get the order item to find the price paid
 const orderItem = order ? (order.items as any[]).find((i: any) => String(i.productId) === productId) : null;
 const pricePaid = orderItem?.price || (purchasedListing ? purchasedListing.priceFinal : product.originalPrice);

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

 // Notify the original seller that they have a new item to resell
 if (originalSellerId) {
 await NotificationModel.create({
 userId: originalSellerId,
 title: "New returned item assigned to you",
 body: `"${product.title}" was returned by a buyer and is now pending your resell decision. Go to Pending Resells to list it.`,
 kind: "RETURN_RECEIVED",
 }).catch(() => {}); // non-blocking
 }

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

 // Update order — if ALL items in the order have been returned, mark the order as CANCELLED
 if (order) {
 const updatedOrder = await OrderModel.findById(orderId).lean();
 if (updatedOrder) {
 const allReturned = updatedOrder.items.every((item: any) =>
 (updatedOrder.returnedProductIds as any[])?.some((rid: any) => String(rid) === String(item.productId))
 );
 if (allReturned) {
 await OrderModel.findByIdAndUpdate(orderId, { status: "CANCELLED" });
 }
 }
 } else if (purchasedListing) {
 await ListingModel.findByIdAndUpdate(orderId, { status: "COMPLETE" });
 }

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