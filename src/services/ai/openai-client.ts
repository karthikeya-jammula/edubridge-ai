// ============================================
// EduBridge AI – OpenAI Service Wrapper
// ============================================

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
  }
): Promise<string> {
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
