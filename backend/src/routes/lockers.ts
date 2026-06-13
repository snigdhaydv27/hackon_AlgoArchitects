
import { Router } from "express";
import { LockerModel } from "../models/Locker.js";

const router = Router();

router.get("/", async (_req, res) => {
 const list = await LockerModel.find({}).lean();
 res.json(list);
});

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

export default router;

