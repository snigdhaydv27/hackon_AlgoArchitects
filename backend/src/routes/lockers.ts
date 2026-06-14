import { Router } from "express";
import { LockerModel } from "../models/Locker.js";
import { ListingModel } from "../models/Listing.js";
import { requireAuth, requireRole } from "../middleware/mockAuth.js";
import { awardCredits } from "../services/greenCredits.js";
import { getCreditSummary } from "../services/greenCredits.js";

const router = Router();

// Public: list all lockers
router.get("/", async (_req, res) => {
  const list = await LockerModel.find({}).lean();
  res.json(list);
});

// Public: find nearby lockers
router.get("/nearby", async (req, res) => {
  const lng = Number(req.query.lng);
  const lat = Number(req.query.lat);
  const maxKm = Number(req.query.maxKm ?? 8);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    res.status(400).json({ error: "lng and lat required" });
    return;
  }
  const list = await LockerModel.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: maxKm * 1000,
      },
    },
  })
    .limit(20)
    .lean();
  res.json(list);
});

// ============================================================
// LOCKER PARTNER DASHBOARD ROUTES
// ============================================================

// GET /api/lockers/my-locker — Get the locker linked to the current user
router.get("/my-locker", requireAuth, requireRole("locker"), async (req, res) => {
  const locker = await LockerModel.findOne({ userId: req.user!.id }).lean();
  if (!locker) {
    res.status(404).json({ error: "No locker linked to your account" });
    return;
  }
  res.json(locker);
});

// GET /api/lockers/my-assignments — Items assigned to this locker partner
router.get("/my-assignments", requireAuth, requireRole("locker"), async (req, res) => {
  const locker = await LockerModel.findOne({ userId: req.user!.id }).lean();
  if (!locker) {
    res.status(404).json({ error: "No locker linked to your account" });
    return;
  }

  const statusFilter = req.query.status as string | undefined;
  const filter: Record<string, unknown> = { lockerId: locker._id };
  if (statusFilter && statusFilter !== "all") {
    filter.status = statusFilter;
  }

  const listings = await ListingModel.find(filter)
    .sort({ createdAt: -1 })
    .populate("productId", "title category brand originalPrice images")
    .populate("lockerId", "name address")
    .lean();

  res.json(listings);
});

// GET /api/lockers/my-stats — Dashboard stats for locker partner
router.get("/my-stats", requireAuth, requireRole("locker"), async (req, res) => {
  const locker = await LockerModel.findOne({ userId: req.user!.id }).lean();
  if (!locker) {
    res.status(404).json({ error: "No locker linked to your account" });
    return;
  }

  const [totalAssigned, liveCount, completedCount, creditSummary] = await Promise.all([
    ListingModel.countDocuments({ lockerId: locker._id }),
    ListingModel.countDocuments({ lockerId: locker._id, status: "LIVE" }),
    ListingModel.countDocuments({ lockerId: locker._id, status: { $in: ["PAID", "COMPLETE"] } }),
    getCreditSummary(req.user!.id),
  ]);

  res.json({
    locker: {
      name: locker.name,
      address: locker.address,
      capacity: locker.capacity,
      occupied: locker.occupied,
    },
    stats: {
      totalAssigned,
      liveCount,
      completedCount,
      creditsEarned: creditSummary.balance,
    },
    creditHistory: creditSummary.history,
  });
});

// PATCH /api/lockers/assignments/:listingId/confirm-handoff — Locker confirms item picked up by buyer
router.patch("/assignments/:listingId/confirm-handoff", requireAuth, requireRole("locker"), async (req, res) => {
  const locker = await LockerModel.findOne({ userId: req.user!.id }).lean();
  if (!locker) {
    res.status(404).json({ error: "No locker linked to your account" });
    return;
  }

  const listing = await ListingModel.findOne({
    _id: req.params.listingId,
    lockerId: locker._id,
  });

  if (!listing) {
    res.status(404).json({ error: "Listing not found or not assigned to your locker" });
    return;
  }

  if (listing.status !== "PAID" && listing.status !== "RESERVED") {
    res.status(400).json({ error: `Cannot confirm handoff for listing with status: ${listing.status}` });
    return;
  }

  listing.status = "COMPLETE";
  await listing.save();

  // Decrement occupied count
  await LockerModel.findByIdAndUpdate(locker._id, { $inc: { occupied: -1 } });

  // Award credits to locker partner for facilitating handoff
  await awardCredits(req.user!.id, "LOCKER_STORAGE", {
    listingId: listing._id,
    returnId: listing.returnId,
    productId: listing.productId,
    descriptionOverride: `Facilitated pickup of "${listing.title}" — item handed off to buyer`,
  });

  res.json({ ok: true, listing: listing.toObject() });
});

export default router;
