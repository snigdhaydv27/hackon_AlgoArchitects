import { Router } from "express";
import { ListingModel } from "../models/Listing.js";
import { ReturnModel } from "../models/Return.js";
import { UserModel } from "../models/User.js";
import { requireAuth } from "../middleware/mockAuth.js";
import { listNearbyListings } from "../services/neighbor.js";
import { buildHealthCard } from "../services/healthCard.js";
import { GradingResult } from "../services/ai/types.js";
import { awardCredits } from "../services/greenCredits.js";
import { getRecommendations } from "../services/recommendations.js";

const router = Router();

// GET /api/listings/shop — Public: returned/renewed items visible in the shop section
router.get("/shop", async (req, res) => {
 const page = Math.max(1, Number(req.query.page) || 1);
 const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
 const skip = (page - 1) * limit;
 const category = req.query.category as string | undefined;

 const filter: Record<string, unknown> = { status: "LIVE" };
 if (category) filter["productId.category"] = category;

 const [items, total] = await Promise.all([
 ListingModel.find({ status: "LIVE" })
 .sort({ createdAt: -1 })
 .skip(skip)
 .limit(limit)
 .populate("productId", "title category brand originalPrice images")
 .populate("lockerId", "name address")
 .lean(),
 ListingModel.countDocuments({ status: "LIVE" }),
 ]);

 // Filter by category if specified (post-populate filter)
 const filtered = category
 ? items.filter((item) => {
 const prod = item.productId as any;
 return prod?.category?.toLowerCase() === category.toLowerCase();
 })
 : items;

 const shopItems = filtered.map((item) => {
 const prod = item.productId as any;
 const locker = item.lockerId as any;
 const originalPrice = prod?.originalPrice ?? item.priceFinal * 2;
 const savingsPercent = Math.round(((originalPrice - item.priceFinal) / originalPrice) * 100);
 return {
 _id: String(item._id),
 title: item.title,
 grade: item.grade,
 priceFinal: item.priceFinal,
 originalPrice,
 savingsPercent,
 summary: item.summary,
 defects: item.defects,
 images: item.images ?? prod?.images ?? [],
 category: prod?.category ?? "",
 brand: prod?.brand ?? "",
 locker: locker ? { name: locker.name, address: locker.address } : null,
 status: item.status,
 createdAt: (item as any).createdAt,
 isReturnedItem: true,
 };
 });

 res.json({ items: shopItems, total, page, limit });
});

router.get("/nearby", requireAuth, async (req, res) => {
 const me = await UserModel.findById(req.user!.id).lean();
 if (!me) {
 res.status(404).json({ error: "User not found" });
 return;
 }
 const coords = me.location!.coordinates as [number, number];
 const items = await listNearbyListings(coords, 25);
 res.json(items);
});

router.get("/recommended", requireAuth, async (req, res) => {
 const me = await UserModel.findById(req.user!.id).lean();
 if (!me) {
 res.status(404).json({ error: "User not found" });
 return;
 }
 const items = await getRecommendations(me);
 res.json(items);
});

router.get("/:id", async (req, res) => {
 const l = await ListingModel.findById(req.params.id)
 .populate("lockerId")
 .populate("productId")
 .populate("sellerId", "name avatar")
 .lean();
 if (!l) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 const product = l.productId as unknown as { originalPrice: number };
 const grading: GradingResult = {
 grade: l.grade as "A" | "B" | "C" | "D",
 summary: l.summary ?? "",
 defects: l.defects ?? [],
 suggestedPriceMin: l.priceFinal,
 suggestedPriceMax: l.priceFinal,
 confidence: 0.9,
 latencyMs: 0,
 provider: "gemini",
 };
 const card = buildHealthCard({
 grading,
 finalPrice: l.priceFinal,
 originalPrice: product?.originalPrice ?? l.priceFinal * 2,
 });
 res.json({ listing: l, healthCard: card });
});

router.post("/:id/reserve", requireAuth, async (req, res) => {
 const l = await ListingModel.findById(req.params.id);
 if (!l) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 if (l.status !== "LIVE") {
 res.status(400).json({ error: `Listing not LIVE (status=${l.status})` });
 return;
 }
 l.buyerId = req.user!.id as unknown as typeof l.buyerId;
 l.status = "RESERVED";
 await l.save();
 res.json(l.toObject());
});

router.post("/:id/drop", requireAuth, async (req, res) => {
 const l = await ListingModel.findById(req.params.id);
 if (!l) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 l.status = "DROPPED";
 await l.save();
 await ReturnModel.findByIdAndUpdate(l.returnId, { status: "DROPPED" });
 res.json(l.toObject());
});

// NOTE: legacy mock-pay still here for fallback. Prefer /api/payment/order/:id + /verify/:id
router.post("/:id/pay", requireAuth, async (req, res) => {
 const l = await ListingModel.findById(req.params.id);
 if (!l) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 if (l.status !== "DROPPED" && l.status !== "RESERVED" && l.status !== "LIVE") {
 res.status(400).json({ error: `Cannot pay when status=${l.status}` });
 return;
 }
 l.status = "PAID";
 l.paymentRef = `MOCK_${Date.now()}`;
 if (!l.buyerId) l.buyerId = req.user!.id as unknown as typeof l.buyerId;
 await l.save();
 await ReturnModel.findByIdAndUpdate(l.returnId, { status: "PAID" });
 res.json(l.toObject());
});

router.post("/:id/pickup", requireAuth, async (req, res) => {
 const { code } = req.body ?? {};
 const l = await ListingModel.findById(req.params.id);
 if (!l) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 if (code && code !== l.pickupCode) {
 res.status(400).json({ error: "Invalid pickup code" });
 return;
 }
 l.status = "COMPLETE";
 await l.save();
 await ReturnModel.findByIdAndUpdate(l.returnId, { status: "COMPLETE" });

 // Reward the buyer for a zero-logistics local pickup (non-blocking).
 if (l.buyerId) {
 await awardCredits(l.buyerId, "LOCAL_PICKUP", { listingId: l._id, returnId: l.returnId });
 }

 // Reward the seller — item successfully resold (non-blocking).
 if (l.sellerId) {
 await awardCredits(l.sellerId, "RETURN_DIVERTED", { listingId: l._id, returnId: l.returnId });
 }

 res.json(l.toObject());
});

router.get("/", requireAuth, async (req, res) => {
 const filter: Record<string, unknown> = {};
 if (req.user!.role === "buyer") {
 filter.buyerId = req.user!.id;
 } else {
 filter.sellerId = req.user!.id;
 }
 const items = await ListingModel.find(filter)
 .populate("lockerId")
 .populate("productId")
 .sort({ createdAt: -1 })
 .lean();
 res.json(items);
});

export default router;