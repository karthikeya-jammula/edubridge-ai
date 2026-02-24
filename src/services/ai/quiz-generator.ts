// ============================================
// EduBridge AI – Quiz Generation Service
// ============================================

import { chatCompletion } from "./openai-client";
import { GenerateQuizInput } from "@/lib/validations";

export interface GeneratedQuestion {
  questionText: string;
  questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

export async function generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuiz> {
  const systemPrompt = `You are an expert quiz creator for educational platforms.
Generate high-quality questions that test understanding, not just memorization.
Always provide clear explanations for correct answers.
Return ONLY valid JSON matching the specified schema.`;

  const formatInstructions = input.questionType === "MCQ"
    ? 'Each question must have exactly 4 options labeled "A", "B", "C", "D". correctAnswer should be the letter (e.g., "A").'
    : input.questionType === "TRUE_FALSE"
    ? 'options should be ["True", "False"]. correctAnswer should be "True" or "False".'
    : 'options should be null. correctAnswer should be a short text answer.';

  const userPrompt = `Generate a quiz with these specifications:
- Topic: ${input.topic}
- Subject: ${input.subject}
- Difficulty: ${input.difficulty || "BEGINNER"}
- Number of questions: ${input.questionCount}
- Question type: ${input.questionType}

${formatInstructions}

Return JSON with this exact structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "questionText": "The question",
      "questionType": "${input.questionType}",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "points": 1
    }
  ]
}`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 3000, responseFormat: "json_object" }
  );

  const parsed: GeneratedQuiz = JSON.parse(response);
  return parsed;
}
