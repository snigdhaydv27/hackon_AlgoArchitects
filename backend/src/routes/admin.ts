import { Router } from "express";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { ProductModel } from "../models/Product.js";
import { OrderModel } from "../models/Order.js";
import { requireAuth, requireRole } from "../middleware/mockAuth.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAuth, requireRole("admin"));

router.get("/stats", async (_req, res) => {
 const [returns, listings, products] = await Promise.all([
 ReturnModel.find({}).lean(),
 ListingModel.find({}).lean(),
 ProductModel.find({}).lean(),
 ]);

 const totalReturns = returns.length;
 const byRoute = returns.reduce<Record<string, number>>((acc, r) => {
 if (r.route) acc[r.route] = (acc[r.route] ?? 0) + 1;
 return acc;
 }, {});

 const recoveryByRoute = returns.reduce<Record<string, number>>((acc, r) => {
 if (r.route) acc[r.route] = (acc[r.route] ?? 0) + (r.estimatedRecovery ?? 0);
 return acc;
 }, {});

 // Liquidation baseline: in old system, 100% of long-tail returns went to liquidation @ ₹0 net.
 const liquidationBaseline = 0;
 const totalRecovery = returns.reduce((s, r) => s + (r.estimatedRecovery ?? 0), 0);
 const totalLogistics = returns.reduce((s, r) => s + (r.logisticsCost ?? 0), 0);
 const netRecovery = totalRecovery - totalLogistics;

 const neighborFirstCount = byRoute["NEIGHBOR_FIRST"] ?? 0;
 const neighborFirstRate = totalReturns ? neighborFirstCount / totalReturns : 0;

 const liveListings = listings.filter((l) => l.status === "LIVE").length;
 const completedListings = listings.filter((l) => l.status === "COMPLETE").length;

 const ordersPrevented = await (await import("../models/PreventionStat.js")).PreventionStatModel.countDocuments();

 res.json({
 totalReturns,
 byRoute,
 recoveryByRoute,
 totalRecovery,
 totalLogistics,
 netRecovery,
 liquidationBaseline,
 neighborFirstRate,
 liveListings,
 completedListings,
 productsCatalogued: products.length,
 preventionStats: ordersPrevented,
 });
});

router.get("/returns", async (_req, res) => {
 const list = await ReturnModel.find({})
 .sort({ createdAt: -1 })
 .populate("productId")
 .populate("sellerId", "name role")
 .lean();
 res.json(list);
});

router.get("/orders", async (_req, res) => {
  const list = await OrderModel.find({})
    .sort({ createdAt: -1 })
    .populate("userId", "name role")
    .lean();
  res.json(list);
});

export default router;

