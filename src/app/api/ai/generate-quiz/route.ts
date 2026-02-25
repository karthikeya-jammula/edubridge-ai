// ============================================
// POST /api/ai/generate-quiz
// Both teachers and students can generate quizzes
// ============================================

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { generateQuizSchema } from "@/lib/validations";
import { generateQuiz } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    // Allow all authenticated users (STUDENT, TEACHER, ADMIN) to generate quizzes
    const body = await request.json();
    const parsed = generateQuizSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const quiz = await generateQuiz(parsed.data);
    return successResponse({ quiz });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return serverErrorResponse();
  }
}
