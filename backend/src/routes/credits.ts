import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { getCreditSummary } from "../services/greenCredits.js";

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

export default router;
