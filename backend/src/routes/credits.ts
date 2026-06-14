import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { getCreditSummary } from "../services/greenCredits.js";
import { UserModel } from "../models/User.js";
import { GreenCreditModel } from "../models/GreenCredit.js";

const router = Router();

// GET /api/credits/me — current points balance + how they were earned.
router.get("/me", requireAuth, async (req, res, next) => {
 try {
 const summary = await getCreditSummary(req.user!.id);
 res.json(summary);
 } catch (e) {
 next(e);
 }
});

// POST /api/credits/apply — Apply credits as discount. Returns the discount amount.
// 1 credit = ₹0.01 (i.e. 100 credits = ₹1)
router.post("/apply", requireAuth, async (req, res, next) => {
 try {
 const { creditsToUse, totalAmount } = req.body ?? {};
 if (!creditsToUse || !totalAmount) {
 res.status(400).json({ error: "creditsToUse and totalAmount required" });
 return;
 }

 const user = await UserModel.findById(req.user!.id).lean();
 if (!user) {
 res.status(404).json({ error: "User not found" });
 return;
 }

 const availableCredits = user.greenCredits ?? 0;
 const credits = Math.min(creditsToUse, availableCredits);

 // 1 credit = ₹0.01 → 100 credits = ₹1
 const discountAmount = Math.min(credits / 100, totalAmount);
 const finalAmount = Math.max(0, totalAmount - discountAmount);
 const creditsUsed = Math.round(discountAmount * 100);

 res.json({
 availableCredits,
 creditsUsed,
 discountAmount: Math.round(discountAmount * 100) / 100,
 finalAmount: Math.round(finalAmount * 100) / 100,
 originalAmount: totalAmount,
 });
 } catch (e) {
 next(e);
 }
});

// POST /api/credits/redeem — Actually deduct credits after payment is confirmed
router.post("/redeem", requireAuth, async (req, res, next) => {
 try {
 const { creditsToUse, listingId } = req.body ?? {};
 if (!creditsToUse || creditsToUse <= 0) {
 res.status(400).json({ error: "creditsToUse must be positive" });
 return;
 }

 const user = await UserModel.findById(req.user!.id).lean();
 if (!user) {
 res.status(404).json({ error: "User not found" });
 return;
 }

 const availableCredits = user.greenCredits ?? 0;
 const credits = Math.min(creditsToUse, availableCredits);
 if (credits <= 0) {
 res.status(400).json({ error: "No credits available to redeem" });
 return;
 }

 // Deduct credits from user
 await UserModel.findByIdAndUpdate(req.user!.id, { $inc: { greenCredits: -credits } });

 // Record the deduction
 await GreenCreditModel.create({
 userId: req.user!.id,
 amount: -credits,
 reason: "LOCAL_PICKUP", // reuse closest reason
 description: `Redeemed ${credits} credits for ₹${(credits / 100).toFixed(2)} discount`,
 listingId: listingId || undefined,
 });

 res.json({
 ok: true,
 creditsRedeemed: credits,
 discountApplied: Math.round((credits / 100) * 100) / 100,
 remainingCredits: availableCredits - credits,
 });
 } catch (e) {
 next(e);
 }
});

export default router;
