// ============================================
// POST /api/ai/translate
// ============================================

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { translateSchema } from "@/lib/validations";
import { translateText, getSupportedLanguages } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const parsed = translateSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const translated = await translateText(parsed.data);
    return successResponse({ translatedText: translated });
  } catch (error) {
    console.error("Translate error:", error);
    return serverErrorResponse();
  }
}

export async function GET() {
  return successResponse({ languages: getSupportedLanguages() });
}
