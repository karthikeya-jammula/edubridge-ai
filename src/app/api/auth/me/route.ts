// ============================================
// GET /api/auth/me – Get current user
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError } from "@/lib/middleware";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        preferredLang: true,
        createdAt: true,
        studentProfile: {
          include: {
            weakTopics: {
              include: { topic: true },
            },
          },
        },
      },
    });

    if (!user) {
      return successResponse(null, "User not found");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Auth me error:", error);
    return serverErrorResponse();
  }
}
