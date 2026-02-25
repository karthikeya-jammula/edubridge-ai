// ============================================
// PUT /api/teacher/quiz/[quizId]/publish – Publish quiz & notify students
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function PUT(
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
        subject: { select: { name: true } },
      },
    });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (quiz.isPublished) {
      return successResponse({ message: "Quiz is already published" });
    }

    // Publish the quiz
    await prisma.quiz.update({
      where: { id: quizId },
      data: { isPublished: true },
    });

    // Notify all active students
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isActive: true, deletedAt: null },
      select: { id: true },
    });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((student) => ({
          userId: student.id,
          title: "New Quiz Available! 📝",
          message: `${auth.name} published "${quiz.title}" in ${quiz.subject?.name || "General"}. Take it now!`,
          type: "quiz",
          quizId: quiz.id,
        })),
      });
    }

    return successResponse({
      message: `Quiz published and ${students.length} students notified!`,
    });
  } catch (error) {
    console.error("Publish quiz error:", error);
    return serverErrorResponse();
  }
}
