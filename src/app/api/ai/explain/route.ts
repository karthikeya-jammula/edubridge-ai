// ============================================
// POST /api/ai/explain
// ============================================

import { NextRequest } from "next/server";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { explainSchema } from "@/lib/validations";
import { explainTopic } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const parsed = explainSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const explanation = await explainTopic(parsed.data);
    return successResponse({ explanation });
  } catch (error) {
    console.error("Explain error:", error);
    return serverErrorResponse();
  }
}
