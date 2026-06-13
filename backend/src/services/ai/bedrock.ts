import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult, ImageInput } from "./types.js";
import { GRADER_SYSTEM, buildUserPrompt } from "./prompt.js";
import { parseGradingJson } from "./parse.js";

export class BedrockGrader implements GradingProvider {
 name = "bedrock" as const;
 private client: BedrockRuntimeClient;

 constructor() {
 this.client = new BedrockRuntimeClient({ region: env.bedrockRegion });
 }

 async grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult> {
 const start = Date.now();

 // Build content array with ALL images
 const contentParts: Array<Record<string, unknown>> = [];
 for (const img of images) {
 contentParts.push({
 type: "image",
 source: { type: "base64", media_type: img.mime, data: img.base64 },
 });
 }
 contentParts.push({
 type: "text",
 text: buildUserPrompt(ctx) + `\n\nYou are analyzing ${images.length} photos of this item from different angles. Consider ALL images for your assessment.`,
 });

 const body = {
 anthropic_version: "bedrock-2023-05-31",
 max_tokens: 600,
 system: GRADER_SYSTEM,
 messages: [{ role: "user", content: contentParts }],
 };

 const cmd = new InvokeModelCommand({
 modelId: env.bedrockModelId,
 contentType: "application/json",
 accept: "application/json",
 body: JSON.stringify(body),
 });
 const resp = await this.client.send(cmd);
 const json = JSON.parse(new TextDecoder().decode(resp.body));
 const text: string = json.content
 ?.filter((b: { type: string }) => b.type === "text")
 .map((b: { text: string }) => b.text)
 .join("") ?? "";
 const parsed = parseGradingJson(text, ctx);
 return { ...parsed, latencyMs: Date.now() - start, provider: "bedrock" };
 }
}
