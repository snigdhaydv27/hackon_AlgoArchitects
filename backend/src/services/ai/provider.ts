import { env } from "../../config/env.js";
import { GeminiGrader } from "./gemini.js";
import { MockGrader } from "./mock.js";
import { GradingProvider } from "./types.js";

let cached: GradingProvider | null = null;

export function getGrader(): GradingProvider {
 if (cached) return cached;
 if (env.geminiApiKey) {
  cached = new GeminiGrader();
 } else {
  cached = new MockGrader();
 }
 console.log(`[ai] using grading provider: ${cached.name}`);
 return cached;
}
