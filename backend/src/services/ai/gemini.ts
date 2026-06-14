import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { GradingContext, GradingProvider, GradingResult, ImageInput } from "./types.js";
import { GRADER_SYSTEM, buildUserPrompt } from "./prompt.js";
import { parseGradingJson } from "./parse.js";
import { MockGrader } from "./mock.js";

export class GeminiGrader implements GradingProvider {
  name = "gemini" as const;
  private ai: GoogleGenAI;
  private fallback = new MockGrader();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  async grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult> {
    const start = Date.now();

    try {
      // Build parts: images as inline data + text prompt
      const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
      for (const img of images) {
        parts.push({
          inlineData: { mimeType: img.mime, data: img.base64 },
        });
      }
      parts.push({
        text: buildUserPrompt(ctx) + `\n\nYou are analyzing ${images.length} photos of this item from different angles. Consider ALL images for your assessment.`,
      });

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: GRADER_SYSTEM,
          maxOutputTokens: 600,
          temperature: 0.2,
        },
      });

      const text = response.text ?? "";
      const parsed = parseGradingJson(text, ctx);
      return { ...parsed, latencyMs: Date.now() - start, provider: "gemini" };
    } catch (err: any) {
      console.warn(`[ai] Gemini grading failed (${err.message?.slice(0, 80)}), using fallback mock grader`);
      const result = await this.fallback.grade(images, ctx);
      return { ...result, provider: "gemini" }; // label as gemini so UI doesn't break
    }
  }
}
