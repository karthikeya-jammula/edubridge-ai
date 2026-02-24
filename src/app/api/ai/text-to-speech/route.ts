// ============================================
// POST /api/ai/text-to-speech
// ============================================

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { ttsSchema } from "@/lib/validations";
import { textToSpeech } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const parsed = ttsSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const result = await textToSpeech(parsed.data);
    return successResponse(result);
  } catch (error) {
    console.error("TTS error:", error);
    return serverErrorResponse();
  }
}
