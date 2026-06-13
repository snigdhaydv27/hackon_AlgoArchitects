import { env } from "../../config/env.js";
import { AnthropicGrader } from "./anthropic.js";
import { BedrockGrader } from "./bedrock.js";
import { NovaGrader } from "./nova.js";
import { MockGrader } from "./mock.js";
import { GradingProvider } from "./types.js";

let cached: GradingProvider | null = null;

export function getGrader(): GradingProvider {
 if (cached) return cached;
 const provider = env.aiProvider;
 if (provider === "bedrock") cached = new BedrockGrader();
 else if (provider === "nova") cached = new NovaGrader();
 else if (provider === "anthropic" && env.anthropicKey) cached = new AnthropicGrader();
 else cached = new MockGrader();
 console.log(`[ai] using grading provider: ${cached.name} (${env.aiProvider})`);
 return cached;
}

