
import { Router } from "express";
import { ProductModel } from "../models/Product.js";

const router = Router();

router.get("/", async (_req, res) => {
 const list = await ProductModel.find({}).lean();
 res.json(list);
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



