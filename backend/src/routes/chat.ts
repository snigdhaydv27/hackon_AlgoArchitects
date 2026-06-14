import express, { Request, Response } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { handleUserMessage } from "../services/chatbot.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { LockerModel } from "../models/Locker.js";

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

    // ===== PLATFORM-WIDE DATA (available to all roles) =====
    const allProducts = await ProductModel.find({}).lean();
    const liveListings = await ListingModel.find({ status: "LIVE" })
      .populate("productId", "title category brand originalPrice")
      .populate("lockerId", "name address")
      .lean();

    const productCatalog = allProducts.map((p) => 
      `- "${p.title}" | Category: ${p.category} | Brand: ${p.brand || "N/A"} | Original Price: ₹${p.originalPrice}`
    ).join("\n");

    const availableListings = liveListings.map((l) => {
      const product = l.productId as any;
      const locker = l.lockerId as any;
      return `- "${l.title}" | Grade: ${l.grade} | Price: ₹${l.priceFinal} | Category: ${product?.category || "N/A"} | Locker: ${locker?.name || "N/A"} (${locker?.address || ""})`;
    }).join("\n");

    const categoriesAvailable = [...new Set(liveListings.map((l) => (l.productId as any)?.category).filter(Boolean))];

    const platformContext = `
--- PLATFORM INVENTORY (REAL-TIME) ---

PRODUCT CATALOG (${allProducts.length} products):
${productCatalog}

CURRENTLY AVAILABLE FOR PURCHASE (${liveListings.length} live listings):
${availableListings.length > 0 ? availableListings : "No listings currently available."}

CATEGORIES WITH LIVE ITEMS: ${categoriesAvailable.length > 0 ? categoriesAvailable.join(", ") : "None currently"}
--- END PLATFORM INVENTORY ---`;

    // ===== ROLE-SPECIFIC DATA =====
    let roleContext = "";

    if (userRole === "seller" || userRole === "small_seller") {
      const returns = await ReturnModel.find({ sellerId: userId }).populate("productId").lean();
      const listings = await ListingModel.find({ sellerId: userId }).lean();

      const totalReturns = returns.length;
      const pendingGrade = returns.filter((r) => r.status === "PENDING_GRADE").length;
      const graded = returns.filter((r) => r.status === "GRADED").length;
      const routed = returns.filter((r) => r.status === "ROUTED").length;
      const listed = returns.filter((r) => r.status === "LISTED").length;
      const completed = returns.filter((r) => r.status === "COMPLETE").length;
      const donated = returns.filter((r) => r.status === "DONATED").length;
      const recycled = returns.filter((r) => r.status === "RECYCLED").length;

      const totalListings = listings.length;
      const liveSellerListings = listings.filter((l) => l.status === "LIVE").length;
      const reservedListings = listings.filter((l) => l.status === "RESERVED").length;
      const soldListings = listings.filter((l) => l.status === "COMPLETE" || l.status === "PAID").length;

      const totalEarnings = listings
        .filter((l) => l.status === "COMPLETE" || l.status === "PAID")
        .reduce((sum, l) => sum + (l.priceFinal || 0), 0);

      const totalEstimatedRecovery = returns.reduce((sum, r) => sum + (r.estimatedRecovery || 0), 0);

      const recentReturns = returns.slice(-5).map((r) => {
        const product = r.productId as any;
        return `- "${product?.title || "Unknown"}" | Grade: ${r.aiGrade || "Pending"} | Status: ${r.status} | Route: ${r.route || "Pending"} | Recovery: ₹${r.estimatedRecovery || 0}`;
      });

      const recentListings = listings.slice(-5).map((l) => {
        return `- "${l.title}" | Grade: ${l.grade} | Price: ₹${l.priceFinal} | Status: ${l.status}`;
      });

      roleContext = `
--- YOUR SELLER DASHBOARD ---
RETURNS: Total ${totalReturns} | Pending: ${pendingGrade} | Graded: ${graded} | Routed: ${routed} | Listed: ${listed} | Completed: ${completed} | Donated: ${donated} | Recycled: ${recycled}
LISTINGS: Total ${totalListings} | Live: ${liveSellerListings} | Reserved: ${reservedListings} | Sold: ${soldListings}
EARNINGS: Total ₹${totalEarnings.toFixed(0)} | Estimated Recovery: ₹${totalEstimatedRecovery.toFixed(0)}

RECENT RETURNS:
${recentReturns.length > 0 ? recentReturns.join("\n") : "No returns yet."}

RECENT LISTINGS:
${recentListings.length > 0 ? recentListings.join("\n") : "No listings yet."}
--- END SELLER DATA ---`;

    } else if (userRole === "buyer") {
      const purchases = await ListingModel.find({ buyerId: userId }).populate("productId").lean();
      const me = await UserModel.findById(userId).lean();

      const totalPurchases = purchases.length;
      const reserved = purchases.filter((p) => p.status === "RESERVED").length;
      const completed = purchases.filter((p) => p.status === "COMPLETE" || p.status === "PAID").length;
      const totalSpent = purchases
        .filter((p) => p.status === "COMPLETE" || p.status === "PAID")
        .reduce((sum, p) => sum + (p.priceFinal || 0), 0);

      const recentPurchases = purchases.slice(-5).map((p) => {
        return `- "${p.title}" | Grade: ${p.grade} | Price: ₹${p.priceFinal} | Status: ${p.status}`;
      });

      const interests = (me as any)?.interests || [];

      roleContext = `
--- YOUR BUYER DASHBOARD ---
PURCHASES: Total ${totalPurchases} | Reserved (awaiting pickup): ${reserved} | Completed: ${completed}
TOTAL SPENT: ₹${totalSpent.toFixed(0)}
YOUR INTERESTS: ${interests.length > 0 ? interests.join(", ") : "Not set"}
YOUR LOCATION: ${(me as any)?.address || "Not set"}

RECENT PURCHASES:
${recentPurchases.length > 0 ? recentPurchases.join("\n") : "No purchases yet."}
--- END BUYER DATA ---`;

    } else if (userRole === "admin") {
      const totalReturns = await ReturnModel.countDocuments();
      const totalListingsAll = await ListingModel.countDocuments();
      const totalUsers = await UserModel.countDocuments();
      const totalLockers = await LockerModel.countDocuments();

      roleContext = `
--- ADMIN OVERVIEW ---
PLATFORM STATS: ${totalReturns} returns processed | ${totalListingsAll} listings created | ${totalUsers} users | ${totalLockers} lockers
--- END ADMIN DATA ---`;
    }

    const reply = await handleUserMessage(message, platformContext + "\n" + roleContext, userName, userRole);
    return res.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
