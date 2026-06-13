import multer from "multer";

const memStorage = multer.memoryStorage();

export const upload = multer({
 storage: memStorage,
 limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
 fileFilter: (_req, file, cb) => {
 if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
 cb(new Error("Only JPEG/PNG/WEBP allowed"));
 return;
 }
 cb(null, true);
 },
});

