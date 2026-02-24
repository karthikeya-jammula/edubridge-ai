// ============================================
// POST /api/ai/speech-to-text
// ============================================

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { sttSchema } from "@/lib/validations";
import { speechToText } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const parsed = sttSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const result = await speechToText(parsed.data);
    return successResponse(result);
  } catch (error) {
    console.error("STT error:", error);
    return serverErrorResponse();
  }
}
