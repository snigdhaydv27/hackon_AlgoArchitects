import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");

let s3: S3Client | null = null;
function getS3() {
 if (!s3) s3 = new S3Client({ region: env.s3Region });
 return s3;
}

export interface StoredFile {
 url: string;
 key: string;
 mime: string;
 base64: string;
}

export async function saveImage(buffer: Buffer, mime: string): Promise<StoredFile> {
 const ext = mimeToExt(mime);
 const key = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
 const base64 = buffer.toString("base64");

 if (env.storageDriver === "s3" && env.s3Bucket) {
 await getS3().send(
 new PutObjectCommand({
 Bucket: env.s3Bucket,
 Key: key,
 Body: buffer,
 ContentType: mime,
 })
 );
 return {
 url: `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com/${key}`,
 key,
 mime,
 base64,
 };
 }

 await fs.mkdir(UPLOADS_DIR, { recursive: true });
 await fs.writeFile(path.join(UPLOADS_DIR, key), buffer);
 return {
 url: `${env.publicBaseUrl}/static/uploads/${key}`,
 key,
 mime,
 base64,
 };
}

function mimeToExt(mime: string): string {
 if (mime.includes("png")) return ".png";
 if (mime.includes("webp")) return ".webp";
 if (mime.includes("jpeg") || mime.includes("jpg")) return ".jpg";
 return ".bin";
}

