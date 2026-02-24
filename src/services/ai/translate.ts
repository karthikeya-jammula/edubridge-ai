// ============================================
// EduBridge AI – Translation Service
// ============================================

import { chatCompletion } from "./openai-client";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "./cache";
import { TranslateInput } from "@/lib/validations";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
};

export async function translateText(input: TranslateInput): Promise<string> {
  const cacheKey = generateCacheKey("translate", input as unknown as Record<string, unknown>);
  const cached = await getCachedResponse(cacheKey);
  if (cached) return cached;

  const targetLang = LANGUAGE_NAMES[input.targetLanguage] || input.targetLanguage;
  const sourceLang = LANGUAGE_NAMES[input.sourceLanguage || "en"] || "English";

  const systemPrompt = `You are a professional translator specializing in educational content.
Translate accurately while maintaining the educational context and meaning.
Preserve any technical terms with their translations in parentheses.
Only output the translated text, nothing else.`;

  const userPrompt = `Translate the following text from ${sourceLang} to ${targetLang}:

${input.text}`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 2000 }
  );

  await setCachedResponse(cacheKey, response, "translate");
  return response;
}

export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
    code,
    name,
  }));
}
