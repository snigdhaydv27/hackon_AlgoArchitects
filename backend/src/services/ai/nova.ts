import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult } from "./types.js";
import { GRADER_SYSTEM, buildUserPrompt } from "./prompt.js";
import { parseGradingJson } from "./parse.js";

// Amazon Nova via Bedrock Converse API.
// Nova uses a different request shape than Claude — Converse API normalizes it.
export class NovaGrader implements GradingProvider {
 name = "bedrock" as const;
 private client: BedrockRuntimeClient;

 constructor() {
 this.client = new BedrockRuntimeClient({ region: env.bedrockRegion });
 }

 async grade(image: { mime: string; base64: string }, ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();
 const format = mimeToNovaFormat(image.mime);
 const cmd = new ConverseCommand({
 modelId: env.novaModelId,
 system: [{ text: GRADER_SYSTEM }],
 messages: [
 {
 role: "user",
 content: [
 { image: { format, source: { bytes: Buffer.from(image.base64, "base64") } } },
 { text: buildUserPrompt(ctx) },
 ],
 },
 ],
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