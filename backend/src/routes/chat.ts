import express, { Request, Response } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { handleUserMessage } from "../services/chatbot.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { ProductModel } from "../models/Product.js";

const router = express.Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const userName = req.user!.name;

    // Build seller/buyer-specific context from the database
    let sellerContext = "";

    if (userRole === "seller" || userRole === "small_seller") {
      // Fetch returns for this seller
      const returns = await ReturnModel.find({ sellerId: userId }).populate("productId").lean();
      const listings = await ListingModel.find({ sellerId: userId }).populate("productId").lean();

      // Calculate stats
      const totalReturns = returns.length;
      const pendingGrade = returns.filter((r) => r.status === "PENDING_GRADE").length;
      const graded = returns.filter((r) => r.status === "GRADED").length;
      const routed = returns.filter((r) => r.status === "ROUTED").length;
      const listed = returns.filter((r) => r.status === "LISTED").length;
      const completed = returns.filter((r) => r.status === "COMPLETE").length;
      const donated = returns.filter((r) => r.status === "DONATED").length;
      const recycled = returns.filter((r) => r.status === "RECYCLED").length;

      const totalListings = listings.length;
      const liveListings = listings.filter((l) => l.status === "LIVE").length;
      const reservedListings = listings.filter((l) => l.status === "RESERVED").length;
      const soldListings = listings.filter((l) => l.status === "COMPLETE" || l.status === "PAID").length;
      const expiredListings = listings.filter((l) => l.status === "EXPIRED").length;

      const totalEarnings = listings
        .filter((l) => l.status === "COMPLETE" || l.status === "PAID")
        .reduce((sum, l) => sum + (l.priceFinal || 0), 0);

      const totalEstimatedRecovery = returns.reduce((sum, r) => sum + (r.estimatedRecovery || 0), 0);

      // Build a list of recent items
      const recentReturns = returns.slice(-5).map((r) => {
        const product = r.productId as any;
        return `- "${product?.title || "Unknown"}" | Grade: ${r.aiGrade || "Pending"} | Status: ${r.status} | Route: ${r.route || "Pending"}`;
      });

      const recentListings = listings.slice(-5).map((l) => {
        return `- "${l.title}" | Grade: ${l.grade} | Price: ₹${l.priceFinal} | Status: ${l.status}`;
      });

      sellerContext = `
--- SELLER DASHBOARD DATA (for ${userName}, role: ${userRole}) ---

RETURNS OVERVIEW:
- Total returns initiated: ${totalReturns}
- Pending AI grading: ${pendingGrade}
- Graded (awaiting routing): ${graded}
- Routed (assigned a path): ${routed}
- Listed on marketplace: ${listed}
- Completed: ${completed}
- Donated: ${donated}
- Recycled: ${recycled}

LISTINGS OVERVIEW:
- Total listings created: ${totalListings}
- Currently live: ${liveListings}
- Reserved by buyers: ${reservedListings}
- Sold (complete/paid): ${soldListings}
- Expired: ${expiredListings}

EARNINGS:
- Total earned from sales: ₹${totalEarnings.toFixed(2)}
- Total estimated recovery value: ₹${totalEstimatedRecovery.toFixed(2)}

RECENT RETURNS (last 5):
${recentReturns.length > 0 ? recentReturns.join("\n") : "No returns yet."}

RECENT LISTINGS (last 5):
${recentListings.length > 0 ? recentListings.join("\n") : "No listings yet."}
--- END SELLER DATA ---`;
    } else if (userRole === "buyer") {
      // For buyers, show their purchases/reservations
      const purchases = await ListingModel.find({ buyerId: userId }).populate("productId").lean();

      const totalPurchases = purchases.length;
      const reserved = purchases.filter((p) => p.status === "RESERVED").length;
      const completed = purchases.filter((p) => p.status === "COMPLETE" || p.status === "PAID").length;

      const totalSpent = purchases
        .filter((p) => p.status === "COMPLETE" || p.status === "PAID")
        .reduce((sum, p) => sum + (p.priceFinal || 0), 0);

      const recentPurchases = purchases.slice(-5).map((p) => {
        return `- "${p.title}" | Grade: ${p.grade} | Price: ₹${p.priceFinal} | Status: ${p.status}`;
      });

      sellerContext = `
--- BUYER DASHBOARD DATA (for ${userName}, role: buyer) ---

PURCHASES OVERVIEW:
- Total items bought/reserved: ${totalPurchases}
- Currently reserved (awaiting pickup): ${reserved}
- Completed purchases: ${completed}
- Total spent: ₹${totalSpent.toFixed(2)}

RECENT PURCHASES (last 5):
${recentPurchases.length > 0 ? recentPurchases.join("\n") : "No purchases yet."}
--- END BUYER DATA ---`;
    }

    const reply = await handleUserMessage(message, sellerContext, userName, userRole);
    return res.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
