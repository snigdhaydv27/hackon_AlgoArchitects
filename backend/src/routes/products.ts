
import { Router } from "express";
import { ProductModel } from "../models/Product.js";
import { ReturnModel } from "../models/Return.js";
import { requireAuth } from "../middleware/mockAuth.js";

const router = Router();

router.get("/", async (_req, res) => {
 const list = await ProductModel.find({}).lean();
 res.json(list);
});

// GET /api/products/for-seller — All products + returned items pending resell for this seller
router.get("/for-seller", requireAuth, async (req, res) => {
 const [allProducts, resellReturns] = await Promise.all([
 ProductModel.find({}).lean(),
 ReturnModel.find({
 originalSellerId: req.user!.id,
 resellStatus: "PENDING_RESELL",
 }).populate("productId").lean(),
 ]);

 // Map resell returns as product-like items
 const resellProducts = resellReturns
 .filter((r) => r.productId)
 .map((r) => {
 const p = r.productId as any;
 return {
 _id: String(p._id),
 title: `[RESELL] ${p.title}`,
 category: p.category,
 brand: p.brand,
 originalPrice: p.originalPrice,
 images: r.images?.length ? r.images : (p.images ?? []),
 description: r.aiSummary || p.description,
 weightGrams: p.weightGrams ?? 500,
 returnId: String(r._id),
 aiGrade: r.aiGrade,
 isResellItem: true,
 };
 });

 res.json([...resellProducts, ...allProducts]);
});

router.get("/:id", async (req, res) => {
 const p = await ProductModel.findById(req.params.id).lean();
 if (!p) {
 res.status(404).json({ error: "Not found" });
 return;
 }
 res.json(p);
});

export default router;

