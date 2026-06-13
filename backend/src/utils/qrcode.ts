import QRCode from "qrcode";
import crypto from "node:crypto";

export function generatePickupCode(): string {
 return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function makeQrDataUrl(payload: string): Promise<string> {
 return QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 240 });
}

