// ============================================
// EduBridge AI – OpenAI Service Wrapper
// ============================================

import OpenAI from "openai";

export const DEMO_MODE = !process.env.OPENAI_API_KEY;

let openai: OpenAI | null = null;
if (!DEMO_MODE) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Attempts an OpenAI chat completion.
 * Throws "DEMO_MODE" when there is no API key, or re-throws
 * the original OpenAI error so callers can decide to fall back.
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
}

export default openai;
