// ============================================
// GET/DELETE /api/teacher/quiz/[quizId] – Single quiz operations
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    const { quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        creatorId: auth.userId,
        deletedAt: null,
      },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        subject: { select: { name: true } },
        _count: { select: { attempts: true } },
      },
    });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    return successResponse({ quiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    const { quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        creatorId: auth.userId,
        deletedAt: null,
      },
    });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Soft delete the quiz
    await prisma.quiz.update({
      where: { id: quizId },
      data: { deletedAt: new Date() },
    });

    // Also remove related notifications
    await prisma.notification.deleteMany({
      where: { quizId },
    });

    return successResponse({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return serverErrorResponse();
  }
}
