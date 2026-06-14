export interface GradingContext {
 category: string;
 brand?: string;
 originalPrice: number;
 title: string;
}

export interface ImageInput {
 mime: string;
 base64: string;
}

export interface GradingResult {
 grade: "A" | "B" | "C" | "D";
 defects: string[];
 summary: string;
 suggestedPriceMin: number;
 suggestedPriceMax: number;
 confidence: number;
 latencyMs: number;
 provider: "gemini" | "mock";
}

export interface GradingProvider {
 name: "gemini" | "mock";
 grade(images: ImageInput[], ctx: GradingContext): Promise<GradingResult>;
}
