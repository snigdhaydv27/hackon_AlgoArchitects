import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { UserModel } from "../models/User.js";
import { checkPurchase } from "../services/prevention.js";

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

export default router;



