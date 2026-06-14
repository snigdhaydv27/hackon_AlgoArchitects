import express, { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { handleUserMessage, handleGuestMessage } from "../services/chatbot.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";
import { LockerModel } from "../models/Locker.js";
import { env } from "../config/env.js";
import type { AuthedUser } from "../middleware/mockAuth.js";

// Optional auth — sets req.user if token is valid, otherwise continues without it
const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthedUser;
      req.user = payload;
    } catch {
      // Invalid token — continue as guest
    }
  }
  next();
};

const router = express.Router();

router.post("/", optionalAuth, async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // ===== GUEST MODE (not logged in) =====
    if (!req.user) {
      const reply = await handleGuestMessage(message);
      return res.json({ reply });
    }

    // ===== LOGGED IN MODE =====
    const userId = req.user.id;
    const userRole = req.user.role;
    const userName = req.user.name;

    // Platform-wide data
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

    // Role-specific data
    let roleContext = "";

    if (userRole === "seller" || userRole === "small_seller") {
      const returns = await ReturnModel.find({ sellerId: userId }).populate("productId").lean();
      const listings = await ListingModel.find({ sellerId: userId }).lean();

      const totalReturns = returns.length;
      const pendingGrade = returns.filter((r) => r.status === "PENDING_GRADE").length;
      const listed = returns.filter((r) => r.status === "LISTED").length;
      const completed = returns.filter((r) => r.status === "COMPLETE").length;

      const totalListings = listings.length;
      const liveSellerListings = listings.filter((l) => l.status === "LIVE").length;
      const soldListings = listings.filter((l) => l.status === "COMPLETE" || l.status === "PAID").length;

      const totalEarnings = listings
        .filter((l) => l.status === "COMPLETE" || l.status === "PAID")
        .reduce((sum, l) => sum + (l.priceFinal || 0), 0);

      const recentReturns = returns.slice(-5).map((r) => {
        const product = r.productId as any;
        return `- "${product?.title || "Unknown"}" | Grade: ${r.aiGrade || "Pending"} | Status: ${r.status} | Route: ${r.route || "Pending"}`;
      });

      roleContext = `
--- YOUR SELLER DASHBOARD ---
RETURNS: Total ${totalReturns} | Pending: ${pendingGrade} | Listed: ${listed} | Completed: ${completed}
LISTINGS: Total ${totalListings} | Live: ${liveSellerListings} | Sold: ${soldListings}
EARNINGS: Total ₹${totalEarnings.toFixed(0)}
RECENT RETURNS:
${recentReturns.length > 0 ? recentReturns.join("\n") : "No returns yet."}
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

      const interests = (me as any)?.interests || [];

      roleContext = `
--- YOUR BUYER DASHBOARD ---
PURCHASES: Total ${totalPurchases} | Reserved: ${reserved} | Completed: ${completed}
TOTAL SPENT: ₹${totalSpent.toFixed(0)}
YOUR INTERESTS: ${interests.length > 0 ? interests.join(", ") : "Not set"}
--- END BUYER DATA ---`;

    } else if (userRole === "admin") {
      const totalReturns = await ReturnModel.countDocuments();
      const totalUsers = await UserModel.countDocuments();
      roleContext = `
--- ADMIN OVERVIEW ---
PLATFORM: ${totalReturns} returns | ${totalUsers} users
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
