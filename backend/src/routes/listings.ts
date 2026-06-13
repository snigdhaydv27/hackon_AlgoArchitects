import { Router } from "express";
import { ListingModel } from "../models/Listing.js";
import { ReturnModel } from "../models/Return.js";
import { UserModel } from "../models/User.js";
import { requireAuth } from "../middleware/mockAuth.js";
import { listNearbyListings } from "../services/neighbor.js";
import { buildHealthCard } from "../services/healthCard.js";
import { GradingResult } from "../services/ai/types.js";

const router = Router();

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
 provider: "anthropic",
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