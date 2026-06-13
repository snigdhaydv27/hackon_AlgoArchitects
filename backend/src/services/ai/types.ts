export interface GradingContext {
 category: string;
 brand?: string;
 originalPrice: number;
 title: string;
}

export interface GradingResult {
 grade: "A" | "B" | "C" | "D";
 defects: string[];
 summary: string;
 suggestedPriceMin: number;
 suggestedPriceMax: number;
 confidence: number;
 latencyMs: number;
 provider: "anthropic" | "bedrock" | "mock";
}

export interface GradingProvider {
 name: "anthropic" | "bedrock" | "mock";
 grade(image: { mime: string; base64: string }, ctx: GradingContext): Promise<GradingResult>;
}

