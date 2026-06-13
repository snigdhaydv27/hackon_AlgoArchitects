import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult, ImageInput } from "./types.js";
import { GRADER_SYSTEM, buildUserPrompt } from "./prompt.js";
import { parseGradingJson } from "./parse.js";

export class AnthropicGrader implements GradingProvider {
 name = "anthropic" as const;
 private client: Anthropic;

 constructor() {
 if (!env.anthropicKey) {
 throw new Error("ANTHROPIC_API_KEY not set");
 }
 this.client = new Anthropic({ apiKey: env.anthropicKey });
 }

 async grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();

 // Build content array with ALL images followed by the text prompt
 const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

 for (const img of images) {
 content.push({
 type: "image",
 source: {
 type: "base64",
 media_type: img.mime as "image/jpeg" | "image/png" | "image/webp",
 data: img.base64,
 },
 });
 }
 content.push({ type: "text", text: buildUserPrompt(ctx) + `\n\nYou are analyzing ${images.length} photos of this item from different angles. Consider ALL images for your assessment.` });

 const resp = await this.client.messages.create({
 model: env.anthropicModel,
 max_tokens: 600,
 system: GRADER_SYSTEM,
 messages: [{ role: "user", content }],
 });

 const text = resp.content
 .filter((b): b is Anthropic.TextBlock => b.type === "text")
 .map((b) => b.text)
 .join("");
 const parsed = parseGradingJson(text, ctx);
 return { ...parsed, latencyMs: Date.now() - start, provider: "anthropic" };
 }
}
