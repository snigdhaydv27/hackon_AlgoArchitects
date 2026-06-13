import Anthropic from "@anthropic-ai/sdk";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult } from "./types.js";
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

 async grade(image: { mime: string; base64: string }, ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();
 const resp = await this.client.messages.create({
 model: env.anthropicModel,
 max_tokens: 600,
 system: GRADER_SYSTEM,
 messages: [
 {
 role: "user",
 content: [
 {
 type: "image",
 source: {
 type: "base64",
 media_type: image.mime as "image/jpeg" | "image/png" | "image/webp",
 data: image.base64,
 },
 },
 { type: "text", text: buildUserPrompt(ctx) },
 ],
 },
 ],
 });
 const text = resp.content
 .filter((b): b is Anthropic.TextBlock => b.type === "text")
 .map((b) => b.text)
 .join("");
 const parsed = parseGradingJson(text, ctx);
 return { ...parsed, latencyMs: Date.now() - start, provider: "anthropic" };
 }
}

