import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult, ImageInput } from "./types.js";
import { GRADER_SYSTEM, buildUserPrompt } from "./prompt.js";
import { parseGradingJson } from "./parse.js";

// Amazon Nova via Bedrock Converse API.
export class NovaGrader implements GradingProvider {
 name = "bedrock" as const;
 private client: BedrockRuntimeClient;

 constructor() {
 this.client = new BedrockRuntimeClient({ region: env.bedrockRegion });
 }

 async grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();

 // Build content array with ALL images
 const contentParts: Array<{ image: { format: string; source: { bytes: Uint8Array } } } | { text: string }> = [];
 for (const img of images) {
 contentParts.push({
 image: { format: mimeToNovaFormat(img.mime), source: { bytes: Buffer.from(img.base64, "base64") } },
 });
 }
 contentParts.push({
 text: buildUserPrompt(ctx) + `\n\nYou are analyzing ${images.length} photos of this item from different angles. Consider ALL images for your assessment.`,
 });

 const cmd = new ConverseCommand({
 modelId: env.novaModelId,
 system: [{ text: GRADER_SYSTEM }],
 messages: [{ role: "user", content: contentParts as any }],
 inferenceConfig: { maxTokens: 600, temperature: 0.2 },
 });
 const resp = await this.client.send(cmd);
 const blocks = resp.output?.message?.content ?? [];
 const text = blocks
 .map((b) => (typeof b.text === "string" ? b.text : ""))
 .filter(Boolean)
 .join("");
 const parsed = parseGradingJson(text, ctx);
 return { ...parsed, latencyMs: Date.now() - start, provider: "bedrock" };
 }
}

function mimeToNovaFormat(mime: string): "jpeg" | "png" | "webp" | "gif" {
 if (mime.includes("png")) return "png";
 if (mime.includes("webp")) return "webp";
 if (mime.includes("gif")) return "gif";
 return "jpeg";
}
