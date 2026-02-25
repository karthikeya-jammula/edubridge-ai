// ============================================
// EduBridge AI – AI Service Wrapper (SambaNova)
// Ultra-fast AI inference with SambaNova Cloud
// ============================================

import OpenAI from "openai";

// SambaNova Cloud API Configuration
const API_KEY = process.env.SAMBANOVA_API_KEY || process.env.AI_API_KEY || "01738283-bf0e-4474-9d88-9ed41d6a8cbf";
const BASE_URL = process.env.AI_BASE_URL || "https://api.sambanova.ai/v1";
const MODEL = process.env.AI_MODEL || "DeepSeek-V3.1"; // Fast & capable

export const DEMO_MODE = !API_KEY || API_KEY === "demo";

let openai: OpenAI | null = null;
if (!DEMO_MODE) {
  openai = new OpenAI({ 
    apiKey: API_KEY,
    baseURL: BASE_URL,
  });
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Attempts an AI chat completion via SambaNova Cloud.
 * Ultra-fast inference with Llama and other models.
 * Retries up to 3 times with exponential backoff on rate limit (429).
 * Throws "DEMO_MODE" when there is no API key.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
  }
): Promise<string> {
  if (!openai) {
    throw new Error("DEMO_MODE");
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
        response_format:
          options?.responseFormat === "json_object"
            ? { type: "json_object" }
            : undefined,
      });
      return response.choices[0]?.message?.content || "";
    } catch (err: any) {
      const isRateLimit = err?.status === 429 || err?.message?.includes("429");
      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
        console.warn(`[SambaNova] Rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.error(`[SambaNova] API error after ${attempt + 1} attempts:`, err?.message || err);
      throw err;
    }
  }
  throw new Error("Unexpected: exhausted retries");
}

export { API_KEY, BASE_URL, MODEL };
export default openai;
