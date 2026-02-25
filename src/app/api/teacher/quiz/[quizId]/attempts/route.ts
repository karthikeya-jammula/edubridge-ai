// ============================================
// GET /api/teacher/quiz/[quizId]/attempts
// Quiz analytics: who attempted, scores, timing
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

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

    // Fetch quiz with all attempts and student info
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, deletedAt: null },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        isPublished: true,
        timeLimit: true,
        createdAt: true,
        subject: { select: { name: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
        attempts: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            score: true,
            maxScore: true,
            percentage: true,
            timeTaken: true,
            completedAt: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return notFoundResponse("Quiz not found");
    }

    // Calculate analytics
    const attempts = quiz.attempts;
    const totalAttempts = attempts.length;

    // Unique students who attempted
    const uniqueStudentIds = new Set(attempts.map((a) => a.user.id));
    const uniqueStudents = uniqueStudentIds.size;

    const avgScore =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) * 100
          ) / 100
        : 0;

    const avgTimeTaken =
      totalAttempts > 0
        ? Math.round(
            attempts.filter((a) => a.timeTaken != null).reduce((sum, a) => sum + (a.timeTaken || 0), 0) /
              Math.max(attempts.filter((a) => a.timeTaken != null).length, 1)
          )
        : 0;

    const highestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    const lowestScore = totalAttempts > 0 ? Math.min(...attempts.map((a) => a.percentage)) : 0;

    // Score distribution
    const scoreDistribution = {
      excellent: attempts.filter((a) => a.percentage >= 80).length,
      good: attempts.filter((a) => a.percentage >= 60 && a.percentage < 80).length,
      average: attempts.filter((a) => a.percentage >= 40 && a.percentage < 60).length,
      poor: attempts.filter((a) => a.percentage < 40).length,
    };

    // Pass/fail rate (passing = 50%+)
    const passCount = attempts.filter((a) => a.percentage >= 50).length;
    const passRate = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0;

    return successResponse({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject?.name || "General",
        difficulty: quiz.difficulty,
        isPublished: quiz.isPublished,
        timeLimit: quiz.timeLimit,
        questionCount: quiz._count.questions,
        createdBy: quiz.creator?.name || "Unknown",
        createdAt: quiz.createdAt.toISOString(),
      },
      analytics: {
        totalAttempts,
        uniqueStudents,
        avgScore,
        avgTimeTaken,
        highestScore,
        lowestScore,
        passRate,
        scoreDistribution,
      },
      attempts: attempts.map((a) => ({
        id: a.id,
        studentId: a.user.id,
        studentName: a.user.name,
        studentEmail: a.user.email,
        score: a.score,
        maxScore: a.maxScore,
        percentage: a.percentage,
        timeTaken: a.timeTaken,
        completedAt: a.completedAt?.toISOString(),
        attemptedAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Quiz attempts error:", error);
    return serverErrorResponse();
  }
}
