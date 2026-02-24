// ============================================
// EduBridge AI – Explain Service
// ============================================

import { chatCompletion } from "./openai-client";
import { generateCacheKey, getCachedResponse, setCachedResponse } from "./cache";
import { ExplainInput } from "@/lib/validations";

export async function explainTopic(input: ExplainInput): Promise<string> {
  const cacheKey = generateCacheKey("explain", input as Record<string, unknown>);
  const cached = await getCachedResponse(cacheKey);
  if (cached) return cached;

  const difficultyMap = {
    BEGINNER: "a 10-year-old child",
    INTERMEDIATE: "a high school student",
    ADVANCED: "a university student",
  };

  const audience = input.simplify
    ? "a 10-year-old child"
    : difficultyMap[input.difficulty || "BEGINNER"];

  const languageInstruction =
    input.language && input.language !== "en"
      ? `Respond entirely in the language with code "${input.language}".`
      : "";

  const systemPrompt = `You are EduBridge AI, an expert educational tutor. 
Your role is to explain concepts clearly, accurately, and engagingly.
Always use analogies and real-world examples.
Structure your response with clear headings and bullet points.
${languageInstruction}`;

  const userPrompt = `Explain the following topic as if you are teaching ${audience}:

Topic: ${input.topic}
${input.subject ? `Subject: ${input.subject}` : ""}

Provide:
1. A clear definition
2. Key concepts (3-5 points)
3. A real-world analogy
4. A simple example
5. Common misconceptions (if any)`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.6, maxTokens: 1500 }
  );

  await setCachedResponse(cacheKey, response, "explain");
  return response;
}
