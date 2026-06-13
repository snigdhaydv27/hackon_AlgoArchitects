import { Router } from "express";
import { requireAuth } from "../middleware/mockAuth.js";
import { NotificationModel } from "../models/Notification.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
 const list = await NotificationModel.find({ userId: req.user!.id })
 .sort({ createdAt: -1 })
 .limit(30)
 .lean();
 res.json(list);
});

router.get("/unread-count", requireAuth, async (req, res) => {
 const count = await NotificationModel.countDocuments({ userId: req.user!.id, read: false });
 res.json({ count });
});

router.post("/:id/read", requireAuth, async (req, res) => {
 await NotificationModel.updateOne(
 { _id: req.params.id, userId: req.user!.id },
 { $set: { read: true } }
 );
 res.json({ ok: true });
});

router.post("/read-all", requireAuth, async (req, res) => {
 await NotificationModel.updateMany({ userId: req.user!.id }, { $set: { read: true } });
 res.json({ ok: true });
});

export default router;