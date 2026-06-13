import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { UserModel } from "../models/User.js";
import { checkPurchase } from "../services/prevention.js";
import { GreenCreditModel } from "../models/GreenCredit.js";
import { awardCredits } from "../services/greenCredits.js";

const router = Router();

router.post("/check", requireAuth, async (req, res) => {
 const { productId, variant } = req.body ?? {};
 if (!productId || !variant) {
 res.status(400).json({ error: "productId and variant required" });
 return;
 }
 const me = await UserModel.findById(req.user!.id).lean();
 const result = await checkPurchase({
 productId,
 variant,
 userProfile: {
 footLengthMm: me?.profile?.footLengthMm ?? undefined,
 preferredSize: me?.profile?.preferredSize ?? undefined,
 },
 });
 res.json(result);
});

// POST /api/prevention/accept — buyer switched to the recommended variant.
// Reward the avoided return once per product (non-blocking).
router.post("/accept", requireAuth, async (req, res, next) => {
 try {
 const { productId } = req.body ?? {};
 if (!productId) {
 res.status(400).json({ error: "productId required" });
 return;
 }
 const already = await GreenCreditModel.findOne({
 userId: req.user!.id,
 productId,
 reason: "RETURN_PREVENTED",
 }).lean();
 if (already) {
 res.json({ awarded: false });
 return;
 }
 await awardCredits(req.user!.id, "RETURN_PREVENTED", { productId });
 res.json({ awarded: true });
 } catch (e) {
 next(e);
 }
});

export default router;



